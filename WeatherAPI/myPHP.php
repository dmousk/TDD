<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['CONTENT_TYPE'] !== 'application/json') {
    http_response_code(400);
    die('Bad Request');
}

$conn = mysqli_connect("dbserver.in.cs.ucy.ac.cy", "student", "gtNgMF8pZyZq6l53", "epl425");

if (!$conn) {
    http_response_code(500);
    die('Server Error');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');

    if (!$input || !json_decode($input)) {
        http_response_code(400);
        die('Bad Request');
    }

    $data = json_decode($input);

    if (!isset($data->dmousk01)) {
        http_response_code(400);
        die('Bad Request');
    }

    $timestamp = time();
    $query = "INSERT INTO requests (username, address, region, city, timestamp) 
            VALUES ('dmousk01', '$data->address', '$data->region', '$data->city', $timestamp)";

    if (!mysqli_query($conn, $query)) {
        http_response_code(500);
        die('Server Error');
    }

    http_response_code(201);
    echo 'Created';
}
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $username = $_GET['username'] ?? null;

    if (!$username) {
        http_response_code(400);
        die('Bad Request');
    }

    $query = "SELECT * FROM requests WHERE username='dmousk01' ORDER BY timestamp DESC LIMIT 5";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        http_response_code(500);
        die('Server Error');
    }

    $rows = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }

    header('Content-Type: application/json');
    http_response_code(200);
    echo json_encode($rows);
}

mysqli_close($conn);
