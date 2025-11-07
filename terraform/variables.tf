variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "webscraping-aero"
}

variable "aws_region" {
  description = "Região AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
  default     = "t3.micro"
}

variable "allowed_cidr_blocks" {
  description = "Blocos CIDR permitidos para acesso SSH e HTTP"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "key_pair_name" {
  description = "Nome do key pair para acesso SSH (opcional)"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "dev"
}