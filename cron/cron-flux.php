<?php
require("config/fluxs.config.php");
require("model/NewsCron.class.php");

$return = NewsCron::execute($fluxs);
NewsCron::tofile($return);

exit;
