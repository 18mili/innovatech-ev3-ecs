# Backend Ventas Innovatech EV3

API REST responsable de registrar y administrar las ventas de Innovatech
Chile. Forma parte del monorepositorio `innovatech-ev3-ecs`.

## Tecnologias

- Java 17
- Spring Boot 3.4.4
- Spring Web, Validation y Data JPA
- MySQL 8
- Maven
- OpenAPI y Swagger UI
- Docker con compilacion multietapa

## Endpoints

Ruta base: `/api/v1/ventas`

| Metodo | Ruta | Operacion |
| --- | --- | --- |
| `GET` | `/api/v1/ventas` | Listar ventas |
| `GET` | `/api/v1/ventas/{id}` | Consultar una venta |
| `POST` | `/api/v1/ventas` | Crear una venta |
| `PUT` | `/api/v1/ventas/{id}` | Actualizar una venta |
| `DELETE` | `/api/v1/ventas/{id}` | Eliminar una venta |
| `GET` | `/api/health` | Comprobar salud del servicio |

Swagger UI queda disponible en `/swagger-ui.html` cuando el servicio esta en
ejecucion.

## Modelo de venta

```json
{
  "direccionCompra": "Av. Innovatech 2026, Santiago",
  "valorCompra": 159990,
  "fechaCompra": "2026-06-20",
  "despachoGenerado": false
}
```

## Variables de entorno

| Variable | Descripcion |
| --- | --- |
| `DB_ENDPOINT` | Host de MySQL |
| `DB_PORT` | Puerto de MySQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USERNAME` | Usuario de aplicacion |
| `DB_PASSWORD` | Contrasena de aplicacion |

Las credenciales reales no se almacenan en Git.

## Ejecucion local

Desde la raiz del monorepositorio:

```bash
docker compose up -d --build backend-ventas
```

La API queda disponible directamente en `http://localhost:8082` y mediante
Nginx en `http://localhost:8080/api/v1/ventas`.

## Pruebas y compilacion

En Windows:

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

## Imagen Docker

Construir desde esta carpeta:

```bash
docker build --provenance=false -t innovatech-ev3-back-ventas:v1 .
```

Repositorio ECR:

```text
630562482864.dkr.ecr.us-east-1.amazonaws.com/innovatech-ev3-back-ventas
```

La imagen final ejecuta la aplicacion con un usuario sin privilegios y expone
el puerto `8080` dentro del contenedor.
