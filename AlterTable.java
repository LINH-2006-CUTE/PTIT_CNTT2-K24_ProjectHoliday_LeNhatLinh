import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class AlterTable {
    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/restaurant_db?useSSL=false&allowPublicKeyRetrieval=true", "root", "123456@");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("ALTER TABLE orders MODIFY status VARCHAR(50)");
            stmt.executeUpdate("ALTER TABLE order_items MODIFY cooking_status VARCHAR(50)");
            System.out.println("Success! Tables altered.");
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
