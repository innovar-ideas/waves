terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}

locals {}

module "db" {
  source            = "./modules/db"
  gcp_project_id    = var.gcp_project_id
  postgres_username = "waves"
  db_instance_name  = "waves-db"
  db_name_dev       = "waves-dev"
  db_name_staging   = "waves-staging"
  db_name_prod      = "waves-prod"
}

provider "google" {
  project = var.gcp_project_id
  region  = "europe-west3"
}

provider "random" {}
