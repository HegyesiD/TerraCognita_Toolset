<?php
header('Content-type: application/json');

$dbhost = "localhost";
$dbname = "the name of your database"; // change this to be the name of your database
$dbuser = "your database username"; // change this to be your database username
$dbpass = "your password"; //change this to be your password

try {
    $conn = new PDO("mysql:host=$dbhost;dbname=$dbname",$dbuser,$dbpass);
} catch(PDOException $err){
    echo "Database connection problem.". $err->getMessage();
    exit();
}

function pdo_debugStrParams($stmt) {
  ob_start();
  $stmt->debugDumpParams();
  $r = ob_get_contents();
  ob_end_clean();
  return $r;
};


try {
    $conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
    
    $sql= "INSERT INTO places 
        (user_id, participant_id, time_start, time_end, place_num, place_lat, place_lng, place_name)
        VALUES
        (:uid, :pid, :tstart, :tend, :num, :lat, :lng, :name )";

    $prep = $conn->prepare($sql);

    $aMarkers = array();
    foreach ( $_POST as $ActKey => $ActValue ) {
        $aVarNamePieces = explode("_", $ActKey);
        if ( $aVarNamePieces[0] == 'marker' ) {
            $iMarkerNum = $aVarNamePieces[1];
            $iMarkerData = $aVarNamePieces[2];
            $sPostActMarkerNamePrefix = 'marker_' . strval($iMarkerNum) . '_';

            if ( ! isset( $aMarkers[$iMarkerNum] ) ) { 
                $aMarkers[$iMarkerNum] = array(); 
                $aMarkers[$iMarkerNum]['uid'] = 'Anon';
                $aMarkers[$iMarkerNum]['pid'] = $_POST['participantID'];
                $aMarkers[$iMarkerNum]['tstart'] = $_POST['timeStart'];
                $aMarkers[$iMarkerNum]['tend'] = $_POST['timeEnd'];
            };
            
            $aMarkers[$iMarkerNum][$iMarkerData] = $_POST[ $sPostActMarkerNamePrefix . $iMarkerData ];
        }
    }

    foreach ( $aMarkers as $aActMarker ) {
        $prep->execute( $aActMarker );
    };

    $aResp = array();
    $aResp['resp_message'] = 'Data stored successfully.';
    $aResp['resp_code'] = 'ok';

} catch(PDOException $e) {
    $aResp = array('resp_message' => 'Data storage error.', 'resp_code' => -1, 'error' => $e->getMessage() );
}

$json = json_encode($aResp);

if ($json === false) {
    // Avoid echo of empty string (which is invalid JSON), and
    // JSONify the error message instead:
    $json = json_encode(["jsonError" => json_last_error_msg()]);
    if ($json === false) {
        $json = '{"jsonError":"unknown"}';
    }
    // Set HTTP response status code to: 500 - Internal Server Error
    http_response_code(500);
}

echo $json;

$conn = null; 
?>