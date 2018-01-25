package edu.tseidler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class Server {
    private static ArrayList<Contact> contacts;

    public static void main(String[] args) throws Exception {
        contacts = new ArrayList<Contact>();
        contacts.add(new Contact("1", "jan", "kowalski", "123123213"));
        contacts.add(new Contact("2", "adam", "nowak", "4231231321"));

        HttpServer server = HttpServer.create(new InetSocketAddress(3000), 0);
        server.createContext("/list", new ListHandler());
        server.createContext("/add", new AddHandler());
        server.setExecutor(null); // creates a default executor
        server.start();
    }

    static class ListHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            respondWithContacts(t);
        }
    }

    static class AddHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            Map <String,String> params = queryToMap(t.getRequestURI().getQuery());
            contacts.add(new Contact("TODO", params.get("firstName"), params.get("lastName"), params.get("phone")));

            respondWithContacts(t);
        }
    }


    private static void respondWithContacts(HttpExchange t) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("{ \"contacts\" : [");
        boolean isFirst = true;
        for(Contact contact : contacts) {
            if(!isFirst) {
                sb.append(",");
            }
            sb.append("{");
            sb.append("\"id\":\"" + contact.getId() + "\",");
            sb.append("\"firstName\":\"" + contact.getFirstName() + "\",");
            sb.append("\"lastName\":\"" + contact.getLastName() + "\",");
            sb.append("\"phone\":\"" + contact.getPhone() + "\"");
            sb.append("}");
            isFirst = false;
        }
        sb.append("]}");

        byte [] response = sb.toString().getBytes();
        t.getResponseHeaders().add("Content-Type", "application/json");
        t.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        t.sendResponseHeaders(200, response.length);
        OutputStream os = t.getResponseBody();
        os.write(response);
        os.close();
    }

    private static Map<String, String> queryToMap(String query){
        Map<String, String> result = new HashMap<String, String>();
        for (String param : query.split("&")) {
            String pair[] = param.split("=");
            if (pair.length>1) {
                result.put(pair[0], pair[1]);
            }else{
                result.put(pair[0], "");
            }
        }
        return result;
    }
}