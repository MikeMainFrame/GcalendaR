<?php

  $source = "gs://milliniumfalcon/gcTimeSlots.xml";
  $countLog = new DOMDocument;
  $countLog->loadXML(file_get_contents($source));
  $root = $countLog->documentElement;
  $newNode = $countLog->createDocumentFragment();
  $newNode->appendXML(file_get_contents("php://input"));
  $root->appendChild($newNode);
  file_put_contents($source, $countLog->saveXML());

  echo "we are good";
?>
