/*

    Supersized - Fullscreen Slideshow jQuery Plugin
    Version : 3.2.7
    Theme     : Shutter 1.1
    
    Site    : www.buildinternet.com/project/supersized
    Author    : Sam Dunn
    Company : One Mighty Roar (www.onemightyroar.com)
    License : MIT License / GPL License

*/

(function($){
    
    theme = {
         
         
         /* Initial Placement
        ----------------------------*/
         _init : function(){
             
             // Center Slide Links
             if (api.options.slide_links) $(vars.slide_list).css('margin-left', -$(vars.slide_list).width()/2);
             
            // Start progressbar if autoplay enabled
            if (api.options.autoplay){
                if (api.options.progress_bar) theme.progressBar();
            }else{
                if ($(vars.play_button).attr('src')) $(vars.play_button).attr("src", vars.image_path + "play.png");    // If pause play button is image, swap src
                if (api.options.progress_bar) $(vars.progress_bar).stop().animate({left : -$(window).width()}, 0 );    //  Place progress bar
            }
            
            
            /* Thumbnail Tray
            ----------------------------*/
            // Hide tray off screen
            $(vars.thumb_tray).animate({bottom : -$(vars.thumb_tray).height()}, 0 );
            
            // Thumbnail Tray Toggle
            $(vars.tray_button).toggle(function(){
                var baseurl = jQuery.trim($('.baseUrl').html());
                $(vars.thumb_tray).stop().animate({bottom : 0, avoidTransforms : true}, 300 );
                if ($(vars.tray_arrow).attr('src')) $(vars.tray_arrow).attr("src", baseurl + vars.image_path + "button-tray-down.png");
                return false;
            }, function() {
                var baseurl = jQuery.trim($('.baseUrl').html());
                $(vars.thumb_tray).stop().animate({bottom : -$(vars.thumb_tray).height(), avoidTransforms : true}, 300 );
                if ($(vars.tray_arrow).attr('src')) $(vars.tray_arrow).attr("src", baseurl + vars.image_path + "button-tray-up.png");
                return false;
            });
            
            // Make thumb tray proper size
            $(vars.thumb_list).width($('> li', vars.thumb_list).length * $('> li', vars.thumb_list).outerWidth(true));    //Adjust to true width of thumb markers
            
            // Display total slides
            if ($(vars.slide_total).length){
                $(vars.slide_total).html(api.options.slides.length);
            }
            
            
            /* Thumbnail Tray Navigation
            ----------------------------*/    
            if (api.options.thumb_links){
                //Hide thumb arrows if not needed
                if ($(vars.thumb_list).width() <= $(vars.thumb_tray).width()){
                    $(vars.thumb_back +','+vars.thumb_forward).fadeOut(0);
                }
                
                // Thumb Intervals
                vars.thumb_interval = Math.floor($(vars.thumb_tray).width() / $('> li', vars.thumb_list).outerWidth(true)) * $('> li', vars.thumb_list).outerWidth(true);
                vars.thumb_page = 0;
                
                // Cycle thumbs forward
                $(vars.thumb_forward).click(function(){
                    if (vars.thumb_page - vars.thumb_interval <= -$(vars.thumb_list).width()){
                        vars.thumb_page = 0;
                        $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                    }else{
                        vars.thumb_page = vars.thumb_page - vars.thumb_interval;
                        $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                    }
                });
                
                // Cycle thumbs backwards
                $(vars.thumb_back).click(function(){
                    if (vars.thumb_page + vars.thumb_interval > 0){
                        vars.thumb_page = Math.floor($(vars.thumb_list).width() / vars.thumb_interval) * -vars.thumb_interval;
                        if ($(vars.thumb_list).width() <= -vars.thumb_page) vars.thumb_page = vars.thumb_page + vars.thumb_interval;
                        $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                    }else{
                        vars.thumb_page = vars.thumb_page + vars.thumb_interval;
                        $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                    }
                });
                
            }
            
            
            /* Navigation Items
            ----------------------------*/
            $(vars.next_slide).click(function() {
                api.nextSlide();
             });
            
            $(vars.prev_slide).click(function() {
                api.prevSlide();
            });
            
                // Full Opacity on Hover
                if(jQuery.support.opacity){
                    $(vars.prev_slide +','+vars.next_slide).mouseover(function() {
                       $(this).stop().animate({opacity:1},100);
                    }).mouseout(function(){
                       $(this).stop().animate({opacity:0.6},100);
                    });
                }
            
            if (api.options.thumbnail_navigation){
                // Next thumbnail clicked
                $(vars.next_thumb).click(function() {
                    api.nextSlide();
                });
                // Previous thumbnail clicked
                $(vars.prev_thumb).click(function() {
                    api.prevSlide();
                });
            }
            
            $(vars.play_button).click(function() {
                api.playToggle();                            
            });
            
            
            /* Thumbnail Mouse Scrub
            ----------------------------*/
            if (api.options.mouse_scrub){
                $(vars.thumb_tray).mousemove(function(e) {
                    var containerWidth = $(vars.thumb_tray).width(),
                        listWidth = $(vars.thumb_list).width();
                    if (listWidth > containerWidth){
                        var mousePos = 1,
                            diff = e.pageX - mousePos;
                        if (diff > 10 || diff < -10) { 
                            mousePos = e.pageX; 
                            newX = (containerWidth - listWidth) * (e.pageX/containerWidth);
                            diff = parseInt(Math.abs(parseInt($(vars.thumb_list).css('left'))-newX )).toFixed(0);
                            $(vars.thumb_list).stop().animate({'left':newX}, {duration:diff*3, easing:'easeOutExpo'});
                        }
                    }
                });
            }
            
            
            /* Window Resize
            ----------------------------*/
            $(window).resize(function(){
                
                // Delay progress bar on resize
                if (api.options.progress_bar && !vars.in_animation){
                    if (vars.slideshow_interval) clearInterval(vars.slideshow_interval);
                    if (api.options.slides.length - 1 > 0) clearInterval(vars.slideshow_interval);
                    
                    $(vars.progress_bar).stop().animate({left : -$(window).width()}, 0 );
                    
                    if (!vars.progressDelay && api.options.slideshow){
                        // Delay slideshow from resuming so Chrome can refocus images
                        vars.progressDelay = setTimeout(function() {
                                if (!vars.is_paused){
                                    theme.progressBar();
                                    vars.slideshow_interval = setInterval(api.nextSlide, api.options.slide_interval);
                                }
                                vars.progressDelay = false;
                        }, 1000);
                    }
                }
                
                // Thumb Links
                if (api.options.thumb_links && vars.thumb_tray.length){
                    // Update Thumb Interval & Page
                    vars.thumb_page = 0;    
                    vars.thumb_interval = Math.floor($(vars.thumb_tray).width() / $('> li', vars.thumb_list).outerWidth(true)) * $('> li', vars.thumb_list).outerWidth(true);
                    
                    // Adjust thumbnail markers
                    if ($(vars.thumb_list).width() > $(vars.thumb_tray).width()){
                        $(vars.thumb_back +','+vars.thumb_forward).fadeIn('fast');
                        $(vars.thumb_list).stop().animate({'left':0}, 200);
                    }else{
                        $(vars.thumb_back +','+vars.thumb_forward).fadeOut('fast');
                    }
                    
                }
            });    
            
                                
         },
         
         
         /* Go To Slide
        ----------------------------*/
         goTo : function(){
             if (api.options.progress_bar && !vars.is_paused){
                $(vars.progress_bar).stop().animate({left : -$(window).width()}, 0 );
                theme.progressBar();
            }
        },
         
         /* Play & Pause Toggle
        ----------------------------*/
         playToggle : function(state){
             var baseurl = jQuery.trim($('.baseUrl').html());
             if (state =='play'){
                 // If image, swap to pause
                 if ($(vars.play_button).attr('src')) $(vars.play_button).attr("src", baseurl + vars.image_path + "pause.png");
                if (api.options.progress_bar && !vars.is_paused) theme.progressBar();
             }else if (state == 'pause'){
                 // If image, swap to play
                if ($(vars.play_button).attr('src')) $(vars.play_button).attr("src", baseurl + vars.image_path + "play.png");
                if (api.options.progress_bar && vars.is_paused)$(vars.progress_bar).stop().animate({left : -$(window).width()}, 0 );
             }
             
         },
         
         
         /* Before Slide Transition
        ----------------------------*/
         beforeAnimation : function(direction){
            if (api.options.progress_bar && !vars.is_paused) $(vars.progress_bar).stop().animate({left : -$(window).width()}, 0 );
               
               appendSlideInfo(slideInfo[vars.current_slide]); //append the slide info
              /* Update Fields
              ----------------------------*/
              // Update slide caption
               if ($(vars.slide_caption).length){
                   (api.getField('title')) ? $(vars.slide_caption).html(api.getField('title')) : $(vars.slide_caption).html('');
               }
            // Update slide number
            if (vars.slide_current.length){
                $(vars.slide_current).html(vars.current_slide + 1);
             }
            
            // Highlight current thumbnail and adjust row position
            if (api.options.thumb_links){
            
                $('.current-thumb').removeClass('current-thumb');
                $('li', vars.thumb_list).eq(vars.current_slide).addClass('current-thumb');
                
                // If thumb out of view
                if ($(vars.thumb_list).width() > $(vars.thumb_tray).width()){
                    // If next slide direction
                    if (direction == 'next'){
                        if (vars.current_slide == 0){
                            vars.thumb_page = 0;
                            $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                        } else if ($('.current-thumb').offset().left - $(vars.thumb_tray).offset().left >= vars.thumb_interval){
                            vars.thumb_page = vars.thumb_page - vars.thumb_interval;
                            $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                        }
                    // If previous slide direction
                    }else if(direction == 'prev'){
                        if (vars.current_slide == api.options.slides.length - 1){
                            vars.thumb_page = Math.floor($(vars.thumb_list).width() / vars.thumb_interval) * -vars.thumb_interval;
                            if ($(vars.thumb_list).width() <= -vars.thumb_page) vars.thumb_page = vars.thumb_page + vars.thumb_interval;
                            $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                        } else if ($('.current-thumb').offset().left - $(vars.thumb_tray).offset().left < 0){
                            if (vars.thumb_page + vars.thumb_interval > 0) return false;
                            vars.thumb_page = vars.thumb_page + vars.thumb_interval;
                            $(vars.thumb_list).stop().animate({'left': vars.thumb_page}, {duration:500, easing:'easeOutExpo'});
                        }
                    }
                }
                
                
            }
            
         },
         
         
         /* After Slide Transition
        ----------------------------*/
         afterAnimation : function(){
             if (api.options.progress_bar && !vars.is_paused) theme.progressBar();    //  Start progress bar
             
             if(api.options.slides.length == vars.current_slide + 1){//check if this is the last animation to fire another ajax request
                var baseurl = jQuery.trim($('.baseUrl').html());
                window.location.href = baseurl + '/site/index/?toptag=' + encodeURIComponent($('#tagName').val()); 
             }
         },
         
         
         /* Progress Bar
        ----------------------------*/
        progressBar : function(){
            $(vars.progress_bar).stop().animate({left : -$(window).width()}, 0 ).animate({ left:0 }, api.options.slide_interval);
        }
         
     
     };
     
     
     /* Theme Specific Variables
     ----------------------------*/
     $.supersized.themeVars = {
         
         // Internal Variables
        progress_delay        :    false,                // Delay after resize before resuming slideshow
        thumb_page             :    false,                // Thumbnail page
        thumb_interval         :    false,                // Thumbnail interval
        image_path            :    '/images/',                // Default image path
                                                    
        // General Elements                            
        play_button            :    '#pauseplay',        // Play/Pause button
        next_slide            :    '#nextslide',        // Next slide button
        prev_slide            :    '#prevslide',        // Prev slide button
        next_thumb            :    '#nextthumb',        // Next slide thumb button
        prev_thumb            :    '#prevthumb',        // Prev slide thumb button
        
        slide_caption        :    '#slidecaption',    // Slide caption
        slide_current        :    '.slidenumber',        // Current slide number
        slide_total            :    '.totalslides',        // Total Slides
        slide_list            :    '#slide-list',        // Slide jump list                            
        
        thumb_tray            :    '#thumb-tray',        // Thumbnail tray
        thumb_list            :    '#thumb-list',        // Thumbnail list
        thumb_forward        :    '#thumb-forward',    // Cycles forward through thumbnail list
        thumb_back            :    '#thumb-back',        // Cycles backwards through thumbnail list
        tray_arrow            :    '#tray-arrow',        // Thumbnail tray button arrow
        tray_button            :    '#tray-button',        // Thumbnail tray button
        
        progress_bar        :    '#progress-bar'        // Progress bar
                                                     
     };                                                
    
     /* Theme Specific Options
     ----------------------------*/                                                
     $.supersized.themeOptions = {                    
                                
        progress_bar        :    1,        // Timer for each slide                                            
        mouse_scrub            :    0        // Thumbnails move with mouse
        
     };
    
    
})(jQuery);

//declare global vars
var imageUrl = [];
var slideInfo = [];
var speed = 1000; //transition speed
var interval = 7500; //time for transition to each slide
var transitionType = 1;//fade transition type

 //document load
jQuery(function($) {
   ajaxifySlideShow();//play the slide
});


function slideshow(image_json)
{
    $('#supersized').html('');
    $.supersized({
            transition              :   transitionType,
            stop_loop               :   false,            // Pauses slideshow on last slide
            transition_speed        :   speed,
            slide_interval          :   interval,
            autoplay                :   1,
            random                  :   0,
            // Size & Position                           
            min_width               :   0,            // Min width allowed (in pixels)
            min_height              :   0,            // Min height allowed (in pixels)
            vertical_center         :   1,            // Vertically center background
            horizontal_center       :   1,            // Horizontally center background
            fit_always              :   0,            // Image will never exceed browser width or height (Ignores min. dimensions)
            fit_portrait            :   1,            // Portrait images will not exceed browser height
            fit_landscape           :   0,            // Landscape images will not exceed browser width
            slides                  :   eval('['+image_json+']'),
    });
                  
}

 

function appendSlideInfo(infoHtml){
    $('#demo-block').empty().append(infoHtml);
}

function isNumber(n) {
  return !isNaN(parseInt(n)) && isFinite(n);
}

//call instagram api
function ajaxifySlideShow(){
   
    var url = jQuery.trim($('div.ajaxSlideShowUrl').html());
    var maxAge = Math.round((new Date()).getTime() / 1000) + 20000;
    var tag_id = $('#tagId').val();
    var age = $('#Age').val();
    
    if(age != '' && isNumber(age)){//check if this is legal or valid number/integer
        var unixBase = parseInt(age);
        if(unixBase > (maxAge - 120000)){ 
           maxAge = unixBase; 
        }
    }
    
    $.ajax({  
                    type: "POST",  
                    url: url,  
                    data: { age:maxAge,tagId:tag_id },
                    cache : false,
                    
                    success: function(response) {
                       if(response != 'none'){
                         
                         var responseSplitter = response.split('||');
                         
                         var imageurlArray = responseSplitter[0];
                         var slideinfoArray = responseSplitter[1];
                        
                         if(imageUrl.length > 0){
                            imageUrl = [];   //clear the array 
                         }
                            
                         if(slideInfo.length > 0){
                              slideInfo = [];
                         }
                           
                        var imageUrlSplitter = imageurlArray.split('$');
                        for (var i=0; i<imageUrlSplitter.length; i++)
                        {
                           imageUrl.push(imageUrlSplitter[i]);
                        }
                       
                        var slideInfoSplitter = slideinfoArray.split('$');
                        for (var i=0; i<slideInfoSplitter.length; i++)
                        {
                           slideInfo.push(slideInfoSplitter[i]);
                        }
                        
                        var imageUrlString = '';
                        for (var i=0; i<imageUrl.length; i++)
                        {
                           if(i == 0){
                               imageUrlString = imageUrl[i];
                           }
                           else{
                               imageUrlString = imageUrlString + ',' + imageUrl[i];
                           }
                        }
                        
                        slideshow(imageUrlString);//play the slide show

                       }else{
                          ajaxifySlideShow();//try to call ajax again
                      }
                    }
                    
                   
           });
           
   
}

