output "postgres_connection_name" {
  value = module.db.postgres_connection_name
}

output "postgres_username" {
  value = module.db.postgres_username
}

output "postgres_password" {
  value     = module.db.postgres_password
  sensitive = true
}

output "postgres_db" {
  value = module.db.postgres_db
}

output "db_private_ip" {
  value = module.db.db_private_ip
}

output "postgres_connection_string" {
  value     = module.db.postgres_connection_string
  sensitive = true
}

output "db_vpc_name" {
  value = module.db.db_vpc_name
}

output "db_vpc_connector_id" {
  value = module.db.db_vpc_connector_id
}
