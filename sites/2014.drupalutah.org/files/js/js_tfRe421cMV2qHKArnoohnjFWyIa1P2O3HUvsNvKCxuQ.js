(function ($) {
  Drupal.behaviors.rate = {
    attach: function(context) {
      $('.rate-widget:not(.rate-processed)', context).addClass('rate-processed').each(function () {
        var widget = $(this);
        // as we use drupal_html_id() to generate unique ids
        // we have to truncate the '--<id>'
        var ids = widget.attr('id').split('--');
        ids = ids[0].match(/^rate\-([a-z]+)\-([0-9]+)\-([0-9]+)\-([0-9])$/);
        var data = {
          content_type: ids[1],
          content_id: ids[2],
          widget_id: ids[3],
          widget_mode: ids[4]
        };

        $('a.rate-button', widget).click(function() {
          var token = this.getAttribute('href').match(/rate\=([a-zA-Z0-9\-_]{32,64})/)[1];
          return Drupal.rateVote(widget, data, token);
        });
      });
    }
  };

  Drupal.rateVote = function(widget, data, token) {
    // Invoke JavaScript hook.
    widget.trigger('eventBeforeRate', [data]);

    $(".rate-info", widget).text(Drupal.t('Saving vote...'));

    // Random number to prevent caching, see http://drupal.org/node/1042216#comment-4046618
    var random = Math.floor(Math.random() * 99999);

    var q = (Drupal.settings.rate.basePath.match(/\?/) ? '&' : '?') + 'widget_id=' + data.widget_id + '&content_type=' + data.content_type + '&content_id=' + data.content_id + '&widget_mode=' + data.widget_mode + '&token=' + token + '&destination=' + encodeURIComponent(Drupal.settings.rate.destination) + '&r=' + random;
    if (data.value) {
      q = q + '&value=' + data.value;
    }

    // fetch all widgets with this id as class
    widget = $('.' + widget.attr('id'));

    $.get(Drupal.settings.rate.basePath + q, function(response) {
      if (response.match(/^https?\:\/\/[^\/]+\/(.*)$/)) {
        // We got a redirect.
        document.location = response;
      }
      else {
        // get parent object
        var p = widget.parent();

        // Invoke JavaScript hook.
        widget.trigger('eventAfterRate', [data]);

        widget.before(response);

        // remove widget
        widget.remove();
        widget = undefined;

        Drupal.attachBehaviors(p);
      }
    });

    return false;
  }
})(jQuery);
;
/**
 * @file
 * Integrate Sidr library with Responsive Menus.
 */
(function ($) {
  /**
   * Preparation for each element Sidr will affect.
   */
  function sidr_it(menuElement, ind, iteration, $windowWidth) {
    // Only apply if window size is correct.
    var $media_size = iteration.media_size || 768;
    // Call Sidr with our settings.
    $(menuElement).once('responsive-menus-sidr', function() {
      var $id = 'sidr-' + ind;
      var $wrapper_id = 'sidr-wrapper-' + ind;
      $(this).before('<div id="' + $wrapper_id + '"><a id="' + $id + '-button" href="#' + $id + '">' + iteration.trigger_txt + '</a></div>');
      $('#' + $wrapper_id).hide();
      if ($windowWidth <= $media_size) {
        $('#' + $wrapper_id).show();
        $(this).hide();
      }
      // Set 1/0 to true/false respectively.
      $.each(iteration, function(key, value) {
        if (value == 0) {
          iteration[key] = false;
        }
        if (value == 1) {
          iteration[key] = true;
        }
      });
      // Sidr power go.
      $('#' + $id + '-button').sidr({
        name: $id || "sidr",
        speed: iteration.speed || 200,
        side: iteration.side || "left",
        source: iteration.selectors[ind] || "#main-menu",
        displace: iteration.displace,
        onOpen: function() { eval(iteration.onOpen); } || function() {},
        onClose: function() { eval(iteration.onClose); } || function() {}
      });
    });
  }


  /**
   * Main loop.
   */
  Drupal.behaviors.responsive_menus_sidr = {
    attach: function (context, settings) {
      settings.responsive_menus = settings.responsive_menus || {};
      var $windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
      $.each(settings.responsive_menus, function(ind, iteration) {
        if (iteration.responsive_menus_style != 'sidr') {
          return true;
        }
        if (!iteration.selectors.length) {
          return;
        }
        // Iterate each selector.
        $.each(iteration.selectors, function(index, value) {
          // Stop if there is no menu element.
          if ($(value).length < 1) {
            return true;
          }
          // Multi-level (selector hits multiple ul's).
          if ($(value).length > 1) {
              $(value).each(function(val_index) {
                if (!$(this).parents('ul').length) {
                  sidr_it(this, index, iteration, $windowWidth);
                }
              });
            }
            else {
              // Single level.
              sidr_it(value, index, iteration, $windowWidth);
            }
        });
      });

      // Handle window resizing.
      $(window).resize(function() {
        // Window width with legacy browsers.
        $windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
        $.each(settings.responsive_menus, function(ind, iteration) {
          if (iteration.responsive_menus_style != 'sidr') {
            return true;
          }
          if (!iteration.selectors.length) {
            return;
          }
          // Iterate each selector.
          $.each(iteration.selectors, function(index, value) {
            // Stop if there is no menu element.
            if ($(value).length < 1) {
              return true;
            }
            var $wrapper_id = 'sidr-wrapper-' + index;
            $media_size = iteration.media_size || 768;
            if ($windowWidth <= $media_size) {
              if (!$(value).hasClass('sidr-hidden')) {
                $('#' + $wrapper_id).show();
                $(value).hide().addClass('sidr-hidden');
              }
            }
            else {
              if ($(value).hasClass('sidr-hidden')) {
                $('#' + $wrapper_id).hide();
                $(value).show().removeClass('sidr-hidden');
              }
            }
          });
        });
      });
    }
  };
}(jQuery));
;
/*! Sidr - v1.2.1 - 2013-11-06
 * https://github.com/artberri/sidr
 * Copyright (c) 2013 Alberto Varela; Licensed MIT */
(function(e){var t=!1,i=!1,n={isUrl:function(e){var t=RegExp("^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$","i");return t.test(e)?!0:!1},loadContent:function(e,t){e.html(t)},addPrefix:function(e){var t=e.attr("id"),i=e.attr("class");"string"==typeof t&&""!==t&&e.attr("id",t.replace(/([A-Za-z0-9_.\-]+)/g,"sidr-id-$1")),"string"==typeof i&&""!==i&&"sidr-inner"!==i&&e.attr("class",i.replace(/([A-Za-z0-9_.\-]+)/g,"sidr-class-$1")),e.removeAttr("style")},execute:function(n,s,a){"function"==typeof s?(a=s,s="sidr"):s||(s="sidr");var r,d,l,c=e("#"+s),u=e(c.data("body")),f=e("html"),p=c.outerWidth(!0),g=c.data("speed"),h=c.data("side"),m=c.data("displace"),v=c.data("onOpen"),y=c.data("onClose"),x="sidr"===s?"sidr-open":"sidr-open "+s+"-open";if("open"===n||"toggle"===n&&!c.is(":visible")){if(c.is(":visible")||t)return;if(i!==!1)return o.close(i,function(){o.open(s)}),void 0;t=!0,"left"===h?(r={left:p+"px"},d={left:"0px"}):(r={right:p+"px"},d={right:"0px"}),u.is("body")&&(l=f.scrollTop(),f.css("overflow-x","hidden").scrollTop(l)),m?u.addClass("sidr-animating").css({width:u.width(),position:"absolute"}).animate(r,g,function(){e(this).addClass(x)}):setTimeout(function(){e(this).addClass(x)},g),c.css("display","block").animate(d,g,function(){t=!1,i=s,"function"==typeof a&&a(s),u.removeClass("sidr-animating")}),v()}else{if(!c.is(":visible")||t)return;t=!0,"left"===h?(r={left:0},d={left:"-"+p+"px"}):(r={right:0},d={right:"-"+p+"px"}),u.is("body")&&(l=f.scrollTop(),f.removeAttr("style").scrollTop(l)),u.addClass("sidr-animating").animate(r,g).removeClass(x),c.animate(d,g,function(){c.removeAttr("style").hide(),u.removeAttr("style"),e("html").removeAttr("style"),t=!1,i=!1,"function"==typeof a&&a(s),u.removeClass("sidr-animating")}),y()}}},o={open:function(e,t){n.execute("open",e,t)},close:function(e,t){n.execute("close",e,t)},toggle:function(e,t){n.execute("toggle",e,t)},toogle:function(e,t){n.execute("toggle",e,t)}};e.sidr=function(t){return o[t]?o[t].apply(this,Array.prototype.slice.call(arguments,1)):"function"!=typeof t&&"string"!=typeof t&&t?(e.error("Method "+t+" does not exist on jQuery.sidr"),void 0):o.toggle.apply(this,arguments)},e.fn.sidr=function(t){var i=e.extend({name:"sidr",speed:200,side:"left",source:null,renaming:!0,body:"body",displace:!0,onOpen:function(){},onClose:function(){}},t),s=i.name,a=e("#"+s);if(0===a.length&&(a=e("<div />").attr("id",s).appendTo(e("body"))),a.addClass("sidr").addClass(i.side).data({speed:i.speed,side:i.side,body:i.body,displace:i.displace,onOpen:i.onOpen,onClose:i.onClose}),"function"==typeof i.source){var r=i.source(s);n.loadContent(a,r)}else if("string"==typeof i.source&&n.isUrl(i.source))e.get(i.source,function(e){n.loadContent(a,e)});else if("string"==typeof i.source){var d="",l=i.source.split(",");if(e.each(l,function(t,i){d+='<div class="sidr-inner">'+e(i).html()+"</div>"}),i.renaming){var c=e("<div />").html(d);c.find("*").each(function(t,i){var o=e(i);n.addPrefix(o)}),d=c.html()}n.loadContent(a,d)}else null!==i.source&&e.error("Invalid Sidr Source");return this.each(function(){var t=e(this),i=t.data("sidr");i||(t.data("sidr",s),"ontouchstart"in document.documentElement?(t.bind("touchstart",function(e){e.originalEvent.touches[0],this.touched=e.timeStamp}),t.bind("touchend",function(e){var t=Math.abs(e.timeStamp-this.touched);200>t&&(e.preventDefault(),o.toggle(s))})):t.click(function(e){e.preventDefault(),o.toggle(s)}))})}})(jQuery);;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox')) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", "event", "Downloads", Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(), Drupal.googleanalytics.getPageUrl(this.href));
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", "pageview", { "page": Drupal.googleanalytics.getPageUrl(this.href) });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", "event", "Mails", "Click", this.href.substring(7));
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode != 2 || (Drupal.settings.googleanalytics.trackDomainMode == 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", "event", "Outbound links", "Click", this.href);
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga('send', 'pageview', location.pathname + location.search + location.hash);
    }
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  $(document).bind("cbox_complete", function () {
    var href = $.colorbox.element().attr("href");
    if (href) {
      ga("send", "pageview", { "page": Drupal.googleanalytics.getPageUrl(href) });
    }
  });

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - http://mydomain.com/node/1 -> /node/1
 * - http://example.com/foo/bar -> http://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
