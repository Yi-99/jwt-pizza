Yirang Lim

Professor Lee
CS 329
Nov 26th, 2024

**Curiosity Report: SQL Injection Prevention**

What is a SQL injection attack? What are the different kinds of SQL injection attacks? A SQL injection attack is when an attacker inserts malicious SQL code into a query often in a form of an user input when web application prompts the user, manipulating the database to execute unintended commands. This can lead to unauthorized access to sensitive user data, data modification, and even in worst cases a complete control over the database. These are some of the examples of SQL injection attacks: In-Band SQL Injection which is when the attacker retrieves data by interacting with the web interface. The common methods are Error-based SQL and Union-based SQL injection. Error-based SQL injection is where the attacker uses database errors to collect useful information. Union-based SQL injection is where the attacker combines results of a query with the original query to gather information. A second type of SQL injection attack is a blind SQL injection. It’s where the attacker cannot directly see the database’s response but can infer information based on the app’s behavior. There are two main types of blind SQL injection attacks: 1. Boolean-based and 2. Time-based SQL injection. Boolean-based is where the attacker exploits true/false conditions to deduce database info and time-based is where the attacker manipulates time delays in queries to infer data. The third type of SQL injection attack is the out-of-band SQL injection. It’s where the attacker exploits the database to send results via a different communication channel (e.g., HTTP requests or DNS lookups). The fourth type of SQL injection attack is Second-Order SQL injection. It’s when the attacker injects malicious SQL code into fields that are stored in the database and executed later. The fifth type of SQL injection attack is Stored SQL injection. It’s when the malicious SQL code is permanently stored in the database, typically in a column or log, and executed when a user interacts with the compromised data.

One of the most common attack techniques is to exploit login forms with ‘ OR 1=1 to bypass authentication, or to use batch SQL commands to perform multiple unintended operations.
One of the ways to prevent SQL injection attacks is to sanitize and validate user inputs and apply least privilege access for database accounts.
	
![image](https://github.com/user-attachments/assets/64830fe8-3405-4041-b736-e6c8f2162033)
