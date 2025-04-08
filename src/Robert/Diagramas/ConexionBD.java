package Robert.Diagramas;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionBD {
    private static final String BBDD = "Marvel_BBDD";
    private static final String URL = "jdbc:mysql://localhost:3306/"+BBDD+"?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";  // Cambia por tu usuario
    private static final String PASSWORD = "Roccerte12!";  // Cambia por tu contraseña

    public static Connection getConnection() throws SQLException {
        Connection connection = null;
        try {
            // Cargar el driver solo si es necesario (Java 8+ no lo requiere)
            Class.forName("com.mysql.cj.jdbc.Driver");
            connection = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("✅ Conexión exitosa a la base de datos.");
        } catch (ClassNotFoundException e) {
            System.err.println("❌ Error: No se encontró el driver de MySQL.");
            e.printStackTrace();
            throw new SQLException("Driver no encontrado.");
        } catch (SQLException e) {
            System.err.println("❌ Error: No se pudo conectar a la base de datos.");
            e.printStackTrace();
            throw e;
        }
        return connection;
    }
}
