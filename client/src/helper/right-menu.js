

    import $ from 'jquery';
    

    
    //Right panel section by hover and click event
    $(document).ready(function() {

        $('.toggle-side').click(function() {
            $(".side-menu").toggleClass("show");
        })

        $('.close-side').click(function() {
            $(".side-menu").toggleClass("show")
        })

        $('.nav-link-m').click(function() {
            if ($(this).hasClass('active') && $('.side-menu').hasClass("show")) {
       
                $('.side-menu').removeClass("show");

            } else {
                $('.side-menu').addClass("show");
            }
        })
    })