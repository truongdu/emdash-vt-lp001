$(window).bind('load', function () {
    "use strict";
    // anchor in page
    $(function () {
        $('a[href^="#"]').click(function () {
            if ($($(this).attr('href')).length) {
                var p = $($(this).attr('href')).offset();
                if ($(window).width() > 767) {
                    $('html,body').animate({
                        scrollTop: p.top - 120
                    }, 600);
                } else {
                    $('html,body').animate({
                        scrollTop: p.top - 80
                    }, 600);
                }
            }
            return false;
        });
    });


    // anchor top page #

    "use strict";
    var hash = location.hash;
    if ($(hash).length) {
        var p1 = $(hash).offset();
        if ($(window).width() > 767) {

            $('html,body').animate({
                scrollTop: p1.top - 120
            }, 600);
        } else {
            $('html,body').animate({
                scrollTop: p1.top - 80
            }, 600);
        }
    }


    AOS.init({
        easing: 'ease-out',
        duration: 1000,
        once: false,
    });

    if ($(window).width() < 769) {
        $('.sec_customer_slick ul ').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 500,
            slidesToShow: 2,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            draggable: true,
            pauseOnFocus: false
        });
    }
});

$(window).bind('load scroll', function () {
    "use strict";
    if ($(this).scrollTop() >= 500) {
        $('.to_top,.fct_tel,.sp_contact,header').addClass('show');
    } else {
        $('.to_top,.fct_tel,.sp_contact,header').removeClass('show');
    }
});

$(document).ready(function () {
    "use strict";
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    // nav
    $(".hamburger").click(function () {
        $(this).toggleClass("is_active");
        $("nav").fadeToggle(100);
    });

    $("nav a:not([href])").click(function () {
        if (windowWidth <= 767) {
            $(this).toggleClass("open");
            $(this).next().stop(1, 0).slideToggle(400);
        } else {
            $(this).removeClass("open");
            $(this).next().removeAttr("style");
        }
    });
    if (windowWidth <= 767) {
        $("nav a[href]").click(function () {
            $('.hamburger').removeClass('is_active');
            $('nav').css('display', 'none');
        });
    }
    // back to top
    $(this).scroll();

    if (windowWidth > 767) {
        $(".to_top").removeAttr("style");
    } else {
        $(".to_top").css("bottom", 60);
    }

    $('.to_top_btn').click(function () {
        $('html, body').animate({
            scrollTop: 0
        }, 600);
    });


    /*================= JS CUSTOM ===================*/

    // JS ONLY PAGE SPECIAL
    $('.faq_list dd').hide();
    $('.faq_list dt').click(function () {
        if ($(this).hasClass('active')) {
            $('.faq_list dt').removeClass('active')
            $('.faq_list dd').slideUp();
        } else {
            $('.faq_list dt').removeClass('active')
            $('.faq_list dd').slideUp();
            $(this).addClass('active');
            $(this).next('dd').slideToggle();
        }
    });


});

$(window).bind('load', function () {
    "use strict";
    $(".error").each(function () {
        var text = $(this).html();
        console.log(text);
        if (text == 'Please enter.') {
            $(this).html(text.replace('Please enter.', 'Vui lòng điền thông tin'));
        } else if (text == 'This is required.') {
            $(this).html(text.replace('This is required.', 'Vui lòng chọn'));
        }


    });

});

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/* Slider                                                               */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
$(document).ready(function () {
    "use strict";
    $('#columnbox_slider').slick({
        infinite: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        variableWidth: true,
        centerMode: false,
        speed: 500,
        autoplay: false,
        autoplaySpeed: 4000,
        arrows: true,
        appendArrows: '.column_arrows',
        dots: false,
        responsive: [{
                breakpoint: 751,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    centerMode: true,
                    variableWidth: false,
                    centerPadding: '0',
                    focusOnSelect: true,
                    swipe: true,
                    touchMove: true,
                    mobileFirst: false,
                }
            },
            {
                breakpoint: 415,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    centerMode: true,
                    variableWidth: false,
                    centerPadding: '20px',
                    swipe: true,
                    touchMove: true,
                }
            }
        ]
    });
});

// prevent f12 & inspect source
/*$(document).keydown(function(event) {
    if (event.keyCode == 123) { // Prevent F12
        return false;
    } else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { // Prevent Ctrl+Shift+I
        return false;
    }
});*/

function anchorLink(el) {
    var p = $(el).offset();

    var transform_offset = 100;

    var obj = $(el);

    var transformMatrix = obj.css("-webkit-transform")
        || obj.css("-moz-transform")
        || obj.css("-ms-transform")
        || obj.css("-o-transform")
        || obj.css("transform");
    var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
    var x = matrix[12] || matrix[4]; //translate x
    var y = matrix[13] || matrix[5]; //translate y

    var pos_PC = obj.attr('data-aos') === "fade-up" || obj.attr('data-aos') === "fade-down" ? (p.top - y - 120) : (p.top - 120);
    var pos_SP = obj.attr('data-aos') === "fade-up" || obj.attr('data-aos') === "fade-down" ? (p.top - y - 80) : (p.top - 80);

    if ($(window).width() > 750) {
        $('html,body').animate({
            scrollTop: pos_PC
        }, 400);
    } else {
        $('html,body').animate({
            scrollTop: pos_SP
        }, 400);
    }
}
