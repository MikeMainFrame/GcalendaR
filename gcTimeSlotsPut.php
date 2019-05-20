<?php

  $source = "gs://milliniumfalcon/gcTimeSlots.json";
  $countlog = file_get_contents("php://input");
  file_put_contents($source, $countlog);
  echo "we are good";

?>
