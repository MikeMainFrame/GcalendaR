<?php

  error_reporting(E_ALL);
  ini_set("display_errors", 1); 
 
  $source = "gs://milliniumfalcon/gcTimeSlots.json";
  $countLog = file_get_contents($source);
  $countLog = $countlog . file_get_contents("php://input");
  file_put_contents($source, $countLog);
  echo "we are good";

?>
