Probar el servidor
---

Ejecuta el servidor con el comando java ServidorSQL.
El servidor estará escuchando en el puerto 8080.

Puedes probarlo utilizando herramientas como Postman o curl. Por ejemplo, si quieres hacer una consulta SELECT, usa curl en la terminal:
curl -X POST -d "SELECT * FROM [tabla];" http://localhost:8080/ejecutarSQL