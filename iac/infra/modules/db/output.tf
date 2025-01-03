output "postgres_connection_name" {
  value = google_sql_database_instance.postgres_instance.connection_name
}

output "postgres_username" {
  value = google_sql_user.postgres_user.name
}

output "postgres_password" {
  value     = google_sql_user.postgres_user.password
  sensitive = true
}

output "postgres_db" {
4  value = google_sql_database.dev_db.name
}

output "db_private_ip" {
  value = google_sql_database_instance.postgres_instance.private_ip_address
}

output "db_vpc_name" {
  value = google_compute_network.db_network.name
}


output "db_vpc_connector_id" {
  value = google_vpc_access_connector.vpc_connector.id
}

output "postgres_connection_string" {
  value = format(
    "postgresql://%s:%s@%s/%s?sslmode=require",
    google_sql_user.postgres_user.name,
    google_sql_user.postgres_user.password,
    google_sql_database_instance.postgres_instance.private_ip_address,
    google_sql_database.dev_db.name,
  )
  sensitive = true
}
