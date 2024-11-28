resource "google_vpc_access_connector" "vpc_connector" {
  name          = "db-vpc-connector"
  region        = "europe-west1"
  network       = "db-network"
  ip_cidr_range = "10.8.0.0/28"
  min_instances = 2
  max_instances = 3
}

resource "google_compute_network" "db_network" {
  name                    = "db-network"
  auto_create_subnetworks = false
}

resource "google_compute_global_address" "private_vpc_range" {
  name          = "db-private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.db_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.db_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_vpc_range.name]
}

resource "random_password" "postgres_password" {
  length  = 16
  special = false
  keepers = {
    # If any value in this map changes, a new password will be generated
    # This ensures the password is stable unless this value changes
    created = "Thu Nov 28 05:15:55 WAT 2024"
  }
}

resource "google_sql_database_instance" "postgres_instance" {
  name                = var.db_instance_name
  database_version    = "POSTGRES_15"
  region              = "europe-west3"
  deletion_protection = true

  settings {
    tier              = "db-g1-small"
    disk_size         = 10
    disk_autoresize   = true
    disk_type         = "PD_SSD" # PD_SSD for performance; use "PD_HDD" for further cost-saving
    availability_type = "ZONAL"  # ZONAL or REGIONAL - Lower cost compared to regional

    backup_configuration {
      enabled    = true
      start_time = "01:00"
    }

    ip_configuration {
      ipv4_enabled                                  = true
      private_network                               = google_compute_network.db_network.id
      enable_private_path_for_google_cloud_services = true
    }
  }
}

resource "google_sql_user" "postgres_user" {
  instance = google_sql_database_instance.postgres_instance.name
  name     = var.postgres_username
  password = random_password.postgres_password.result
}

resource "google_sql_database" "dev_db" {
  name     = var.db_name_dev
  instance = google_sql_database_instance.postgres_instance.name
}

resource "google_sql_database" "staging_db" {
  name     = var.db_name_staging
  instance = google_sql_database_instance.postgres_instance.name
}

resource "google_sql_database" "prod_db" {
  name     = var.db_name_prod
  instance = google_sql_database_instance.postgres_instance.name
}
