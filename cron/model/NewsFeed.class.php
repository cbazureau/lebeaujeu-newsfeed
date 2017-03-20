<?php
require("NewsPost.class.php");
class NewsFeed
{
    var $posts = array();

    function xml2array ( $xmlObject, $out = array () )
    {
        foreach ( (array) $xmlObject as $index => $node )
            $out[$index] = ( is_object ( $node ) ) ? NewsFeed::xml2array ( $node ) : $node;

        return $out;
    }

    function __construct($url)
    {   
        $data = $this->getData($url);
        echo $url." - ".$data['status']." - ".strlen($data['data'])."\n";

        if ($data['status'] != "200")
            return;

        if (!($x = simplexml_load_string($data['data'])))
            return;

        foreach ($x->channel->item as $item)
        {
            $post = new NewsPost();
            $post->date  = (string) $item->pubDate;
            $post->ts    = strtotime($item->pubDate);
            $post->link  = (string) $item->link;
            $post->title = (string) $item->title;
            $post->text  = (string) $item->description;
            $cat = NewsFeed::xml2array($item->category);
            $post->categories = [];
            if(count($cat) && is_string($cat[0])) {
                $post->categories = $cat;
            } else if (isset($item->category[0])) {
                $post->categories = array_map(array('NewsFeed', 'simpleToString'),(array) $item->category);
            }
            $this->posts[] = $post;
        }
    }

    function simpleToString($value) {
        return (string) $value;
    }

    private function getData($url) {
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      if(getenv('HTTP_SERVER'))
      {
          curl_setopt($ch, CURLOPT_HTTPPROXYTUNNEL, 1);
          curl_setopt($ch, CURLOPT_PROXY, getenv('HTTP_SERVER'));
      }
      curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
      curl_setopt($ch, CURLOPT_MAXREDIRS, 2);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
      $curldata = curl_exec($ch);
      $info = curl_getinfo($ch);
      curl_close($ch);
      return array("data" => $curldata, "status" => $info['http_code']);
    }

    private function summarizeText($summary) {
        $summary = strip_tags($summary);

        // Truncate summary line to 100 characters
        $max_len = 100;
        if (strlen($summary) > $max_len)
            $summary = substr($summary, 0, $max_len) . '...';

        return $summary;
    }
}