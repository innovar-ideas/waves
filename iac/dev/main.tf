terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }

  backend "gcs" {
    bucket = "waves-infra"
    prefix = "services/dev"
  }
}

locals {}

provider "google" {
  project = var.gcp_project_id
  region  = "europe-west1"
}

resource "google_cloud_run_v2_service" "app_service" {
  name     = var.service_name
  location = "europe-west1"

  timeouts {
    create = "5m"
    update = "3m"
  }

  template {
    containers {
      image = var.container_image_name

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      ports {
        container_port = 3000
      }

      liveness_probe {
        http_get {
          path = "/"
        }
      }
    }

    vpc_access {
      connector = var.db_vpc_connector_id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service_iam_policy" "policy_staging" {
  name        = google_cloud_run_v2_service.app_service.name
  location    = google_cloud_run_v2_service.app_service.location
  project     = google_cloud_run_v2_service.app_service.project
  policy_data = data.google_iam_policy.noauth.policy_data
}

# resource "google_cloud_run_domain_mapping" "domain_mapping" {
#   name     = "waves.com"
#   location = google_cloud_run_v2_service.app_service.location
#   spec {
#     route_name = google_cloud_run_v2_service.app_service.name
#   }
#   metadata {
#     namespace = "waves-425519"
#   }
# }

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
