// Usando JDBC para SQL Server
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class XmlToSQLServer {
    public static void main(String[] args) {
        String connectionUrl = "jdbc:sqlserver://localhost:1433;databaseName=tu_basedatos;user=usuario;password=contraseña";
        String xmlFilePath = "C:\\ruta\\completa\\marvel_data.xml"; // SQL Server necesita ruta completa
        
        try (Connection conn = DriverManager.getConnection(connectionUrl)) {
            String sql = "INSERT INTO marvel_characters " +
                         "SELECT " +
                         "   x.character.value('id[1]', 'INT') as character_id, " +
                         "   x.character.value('name[1]', 'VARCHAR(100)') as name " +
                         "FROM (SELECT CAST(x AS XML) FROM OPENROWSET(BULK '" + xmlFilePath + "', SINGLE_BLOB) AS T(x)) AS T(x) " +
                         "CROSS APPLY x.nodes('/marvelData/data/results/character') AS x(character)";
            
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.executeUpdate();
            
            System.out.println("Datos importados correctamente a SQL Server");
            
        } catch (Exception e) {
            System.err.println("Error al importar a SQL Server: " + e.getMessage());
        }
    }
}