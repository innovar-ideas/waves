variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "waves-425519"
}

variable "service_name" {
  type    = string
  default = "waves-dev"
}

variable "container_image_name" {
  type        = string
  description = "Container image name"
  default     = "europe-docker.pkg.dev/waves-425519/cr/preview.app:4eead4a"
}

variable "db_vpc_connector_id" {
  type    = string
  default = "projects/waves-425519/locations/europe-west1/connectors/db-vpc-connector"
}
