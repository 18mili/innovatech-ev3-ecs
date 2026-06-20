# Innovatech Chile - EV3 DevOps

Aplicacion de gestion de ventas y despachos preparada para contenedores y
despliegue automatizado en Amazon ECS.

## Arquitectura

- `frontend`: React y Vite, servido por Nginx.
- `backend-ventas`: API REST Spring Boot para ventas.
- `backend-despachos`: API REST Spring Boot para despachos.
- `mysql-ventas`: base de datos local del servicio de ventas.
- `mysql-despachos`: base de datos local del servicio de despachos.

Nginx expone una unica entrada y enruta las solicitudes hacia ambas APIs.
En AWS, las imagenes de aplicacion se almacenan en Amazon ECR y se desplegaran
como servicios de Amazon ECS.

## Ejecucion local

Requisitos:

- Docker Desktop
- Docker Compose

Iniciar la aplicacion:

```bash
docker compose up -d --build
```

Abrir `http://localhost:8080`.

Detener los contenedores sin eliminar los datos:

```bash
docker compose down
```

## Puertos locales

| Servicio | Puerto |
| --- | ---: |
| Frontend | 8080 |
| API de despachos | 8081 |
| API de ventas | 8082 |
| MySQL despachos | 3307 |
| MySQL ventas | 3308 |

## Variables locales

El archivo `.env.example` contiene valores de desarrollo. Para usar otros
valores, crear un archivo `.env`, que esta excluido de Git.

## Imagenes en Amazon ECR

- `innovatech-ev3-frontend`
- `innovatech-ev3-back-ventas`
- `innovatech-ev3-back-despachos`

Cada repositorio utiliza las etiquetas `v1` y `latest` y tiene habilitado el
escaneo de seguridad. Las tres imagenes fueron verificadas sin hallazgos antes
del despliegue inicial.

## Validaciones completadas

- Compilacion de las tres imagenes.
- Inicio saludable de los cinco contenedores locales.
- Creacion, consulta y actualizacion de ventas y despachos.
- Comunicacion del frontend con ambas APIs mediante Nginx.
- Persistencia de datos despues de reiniciar los contenedores.
- Auditoria de dependencias de produccion del frontend sin vulnerabilidades.
- Publicacion y escaneo de las imagenes en Amazon ECR.

## Proximas etapas EV3

1. Crear la infraestructura y los servicios en Amazon ECS.
2. Configurar balanceo de carga, health checks y auto scaling.
3. Incorporar workflows de GitHub Actions para build, push y deploy.
4. Configurar secretos y observabilidad con servicios de AWS.
