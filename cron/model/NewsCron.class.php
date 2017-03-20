<?php
require("NewsFeed.class.php");
class NewsCron
{
    function tofile($data) {
      echo "=> NewsCron::tofile \n";
      file_put_contents(dirname(__FILE__).'/../../cron-data/news.json',json_encode($data));
    }

    function execute($fluxs)
    {
      echo "=> NewsCron::execute \n";
      $feeds = [];

      for($i = 0;$i < count($fluxs); $i++) {
          $feeds[$i] = new NewsFeed($fluxs[$i]['url']);
      }

      $news = [];
      for($i = 0;$i < count($feeds); $i++) {
          $posts = $feeds[$i]->posts;

          for($p = 0;$p < count($posts); $p++) {
              if(!in_array('Editos',$posts[$p]->categories) && $posts[$p]->ts > strtotime("-15 days"))
              {
                //if (limit.utc() < moment(item.date).utc() && !item.categories.some(cat => cat === 'Editos')) {
                $news[] = array(
                    'flux' => $fluxs[$i],
                    'link' => $posts[$p]->link,
                    'timestamp' => $posts[$p]->ts,
                    'date' => date("d/m/y H:i", $posts[$p]->ts),
                    'title' => $posts[$p]->title,
                    'categories' => $posts[$p]->categories,
                    'description' => $posts[$p]->text //item.description || item['rss:description'] 
                );
              }
          }
      }

      usort($news, array("NewsCron","sortByTimestamp"));

      return array("news" => $news, "fluxs" => $fluxs);
    } 

    function sortByTimestamp($a, $b){
        if ($a['timestamp'] == $b['timestamp']) return 0;
        return ($a['timestamp'] > $b['timestamp']) ? -1 : 1;
    }

}  