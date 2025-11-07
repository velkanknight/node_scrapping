output "instance_public_ip" {
  description = "IP público da instância EC2"
  value       = aws_eip.webscraping_eip.public_ip
}

output "instance_public_dns" {
  description = "DNS público da instância EC2"
  value       = aws_instance.webscraping_server.public_dns
}

output "application_url" {
  description = "URL para acessar a aplicação"
  value       = "http://${aws_eip.webscraping_eip.public_ip}:3001"
}

output "ssh_command" {
  description = "Comando para conectar via SSH"
  value       = var.key_pair_name != "" ? "ssh -i ${var.key_pair_name}.pem ec2-user@${aws_eip.webscraping_eip.public_ip}" : "SSH key pair não configurado"
}

output "security_group_id" {
  description = "ID do Security Group criado"
  value       = aws_security_group.webscraping_sg.id
}

output "vpc_id" {
  description = "ID da VPC criada"
  value       = aws_vpc.main.id
}