
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

  function PluginException(message) {
    this.message = message;
    this.status = 'error';
  }

  PluginException.prototype.toString = function() {
    return this.status + ': "' + this.message + '"';
  }


  createNewEntry = function(word){
    var selectedString = word.selectionText;
    selectedString = validateString(selectedString);
    var encoded = encodeURIComponent(selectedString);
    var matches = {
      '%3B%20': '%3B%20%0D%0A',
      '%7D': '%7D%0D%0A',
      '%7B': '%7B%0D%0A',
      '%20': '+',
      '%C2%A0': '+'
    };
    encoded = encoded.replace(/(%3B%20|%7D|%7B|%20|%C2%A0)/g, function ($0){
      return matches[$0] != undefined ? matches[$0] : $0;
    });
    createEntry(encoded);
  }

  function validateString(text){
    var string = text.replace(/^\s+|\s+$/g, '');
    if (string.length === 0){
      throw new PluginException(":( \n String can not be empty ");
    }
    var position = string.indexOf('<?php');
    if (position < 0) {
      string = '<?php ' + string;
    }else if(position != 0){
      string = string.replace(/<?php/gi, '');
      string = '<?php ' + string;
    }
    //console.log(string, text);
    return string;
  }

  function createEntry(encoded){
    var url = "https://3v4l.org/new";
    fetch(url, {
      method : "POST",
      headers: {
      "content-type" : "application/x-www-form-urlencoded",
      "cache-control": "no-cache"
      },
        body : "title=&code="+encoded,
      }).then(function(response) {
      if (response.status != 200) {
        throw new PluginException(":( \n Something went wrong! Please try again later ");
      }
      return  response.text();
      }).then(function(html) {
        var parsedResponse = (new window.DOMParser()).parseFromString(html, "text/html");
        var myArray = /\b(\w+)$/.exec(parsedResponse.title)[1];
        var url = "https://3v4l.org/"+myArray;
        chrome.tabs.create({url: url});
      }).catch(function(err) {
        if (err instanceof PluginException) {
          sendMessageToClient("error", err.message);
        }else{
          sendMessageToClient("error", "Something went wrong! Please try again later.");
        }
        console.log(err);
    });
  }

    chrome.contextMenus.create({
      title: "Run on https://3v4l.org/",
      contexts:["selection"],
      onclick: createNewEntry
    });

    function sendMessageToClient(status, message){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0){
          chrome.tabs.sendMessage(tabs[0].id, {status: status, message: message }, function(response) {

          });
        }
      });
    }
