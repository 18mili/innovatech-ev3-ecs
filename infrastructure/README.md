# Infraestructura AWS EV3

Infraestructura productiva de Innovatech Chile desplegada en `us-east-1` con
Amazon ECS Fargate.

## URL publica

```text
http://innovatech-ev3-alb-817468448.us-east-1.elb.amazonaws.com
```

## Componentes

- Cluster ECS `innovatech-ev3-cluster` con Container Insights.
- Tres servicios Fargate independientes para frontend, ventas y despachos.
- Application Load Balancer publico en dos zonas de disponibilidad.
- Tres target groups con health checks especificos.
- RDS MySQL `db.t3.micro`, privado, cifrado y con respaldo diario.
- Secrets Manager para la contrasena de base de datos.
- Tres repositorios ECR con escaneo al publicar.
- CloudWatch Logs con retencion de siete dias.
- Auto scaling por CPU con minimo 1, maximo 3 y objetivo de 60%.
- Deployment circuit breaker con rollback automatico.

## Enrutamiento del ALB

| Prioridad | Ruta | Servicio |
| ---: | --- | --- |
| 10 | `/api/v1/ventas*` | Backend ventas, puerto 8080 |
| 20 | `/api/v1/despachos*` | Backend despachos, puerto 8081 |
| Predeterminada | `/*` | Frontend Nginx, puerto 80 |

## Seguridad de red

- Solo el ALB acepta HTTP desde Internet.
- Cada tarea ECS acepta trafico unicamente desde el security group del ALB.
- RDS acepta MySQL unicamente desde los security groups de ambos backends.
- RDS no posee direccion publica.
- Las tareas usan IP publica solo para salida a ECR y servicios AWS, mientras
  que sus reglas de entrada permanecen restringidas.
- La contrasena no existe en Git ni en las definiciones de tareas.

## Definiciones de tareas

Los JSON en `infrastructure/ecs/` son las plantillas utilizadas por ECS y por
GitHub Actions. Cada pipeline reemplaza la URI de imagen por una etiqueta
inmutable basada en el SHA del commit antes de desplegar una nueva revision.

## CI/CD

Los workflows en `.github/workflows/` ejecutan este flujo por componente:

1. Obtener el codigo.
2. Configurar credenciales temporales de AWS Academy.
3. Construir la imagen Docker.
4. Publicar la imagen en ECR.
5. Registrar una nueva revision de la task definition.
6. Actualizar el servicio ECS y esperar estabilidad.

Las credenciales de AWS Academy expiran. Al iniciar una sesion nueva del
Learner Lab se deben actualizar estos secretos del repositorio:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

### Primera ejecucion validada

Los tres pipelines se ejecutaron correctamente el 20 de junio de 2026:

| Pipeline | Resultado | Duracion | Evidencia |
| --- | --- | ---: | --- |
| Frontend | Exitoso | 4 min 12 s | [GitHub Actions](https://github.com/18mili/innovatech-ev3-ecs/actions/runs/27870621266) |
| Ventas | Exitoso | 5 min | [GitHub Actions](https://github.com/18mili/innovatech-ev3-ecs/actions/runs/27870621257) |
| Despachos | Exitoso | 4 min 12 s | [GitHub Actions](https://github.com/18mili/innovatech-ev3-ecs/actions/runs/27870621261) |

Cada pipeline publico una imagen con la etiqueta del SHA `ab7636b`, registro
la revision 2 de su task definition y dejo su servicio ECS estable. Despues del
despliegue se verificaron HTTP 200 y la persistencia de los registros de venta
y despacho en RDS.

## Resultados medidos

Mediciones iniciales realizadas el 20 de junio de 2026:

| Ruta | Promedio | Minimo | Maximo |
| --- | ---: | ---: | ---: |
| `/` | 182.4 ms | 143.7 ms | 302.1 ms |
| `/api/v1/ventas` | 242.5 ms | 147.3 ms | 513.6 ms |
| `/api/v1/despachos` | 250.9 ms | 143.4 ms | 574.1 ms |

Los backends iniciaron en aproximadamente 35 segundos. La prueba de
autorecuperacion detuvo una tarea frontend y ECS restauro una tarea nueva,
target saludable y HTTP 200 en 78.9 segundos.
