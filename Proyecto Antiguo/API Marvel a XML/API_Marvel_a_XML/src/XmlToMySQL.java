// Usando JDBC para importar a MySQL
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class XmlToMySQL {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/tu_basedatos";
        String user = "usuario";
        String password = "contraseña";
        
        String xmlFilePath = "marvel_data.xml";
        
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String sql = "LOAD XML LOCAL INFILE ? INTO TABLE marvel_characters ROWS IDENTIFIED BY '<character>'";
            
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, xmlFilePath);
            pstmt.executeUpdate();
            
            System.out.println("Datos importados correctamente a MySQL");
            
        } catch (SQLException e) {
            System.err.println("Error al importar a MySQL: " + e.getMessage());
        }
    }
}