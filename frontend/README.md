# Frontend Innovatech EV3

Panel web para gestionar ventas y despachos de Innovatech Chile. Forma parte
del monorepositorio `innovatech-ev3-ecs`.

## Tecnologias

- React 18
- Vite 5
- Axios
- SweetAlert2
- Nginx
- Docker con compilacion multietapa

## Funcionalidades

- Visualizacion de indicadores de ventas y despachos.
- Listado y busqueda de operaciones.
- Creacion de ventas.
- Generacion y actualizacion de despachos.
- Actualizacion automatica de los datos.
- Consulta del estado de ambos backends.

## Integracion con las APIs

El navegador utiliza rutas relativas para mantener un unico origen:

- `/api/v1/ventas`
- `/api/v1/despachos`
- `/health/ventas`
- `/health/despachos`

En el contenedor, Nginx sirve los archivos compilados y actua como proxy hacia
`backend-ventas` y `backend-despachos`.

## Ejecucion recomendada

Desde la raiz del monorepositorio:

```bash
docker compose up -d --build
```

La aplicacion queda disponible en `http://localhost:8080`.

## Desarrollo y validacion

Instalar dependencias y compilar:

```bash
npm ci
npm run build
```

Ejecutar el analisis estatico:

```bash
npm run lint
```

Auditar solo las dependencias que forman parte de produccion:

```bash
npm audit --omit=dev
```

## Imagen Docker

Construir desde esta carpeta:

```bash
docker build --provenance=false -t innovatech-ev3-frontend:v1 .
```

Repositorio ECR:

```text
630562482864.dkr.ecr.us-east-1.amazonaws.com/innovatech-ev3-frontend
```

La imagen final contiene solo Nginx y los archivos estaticos compilados; Node.js
y las dependencias de desarrollo permanecen en la etapa de construccion.
