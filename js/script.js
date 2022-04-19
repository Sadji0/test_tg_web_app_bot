Telegram.WebApp.ready();

var initData = Telegram.WebApp.initData || '';
var initDataUnsafe = Telegram.WebApp.initDataUnsafe || {};

function sendMessage(msg_id, with_webview) {
    if (!initDataUnsafe.query_id) {
        alert('WebViewQueryId not defined');
        return;
    }
    $('button').prop('disabled', true);
    $('#btn_status').text('Sending...').removeClass('ok err').show();
    $.ajax('/demo/sendMessage', {
        type: 'POST',
        data: { _auth: initData, msg_id: msg_id || '', with_webview: !initDataUnsafe.receiver && with_webview ? 1 : 0 },
        dataType: 'json',
        success: function (result) {
            $('button').prop('disabled', false);
            if (result.response) {
                if (result.response.ok) {
                    $('#btn_status').html('Message sent successfully!').addClass('ok').show();
                } else {
                    $('#btn_status').text(result.response.description).addClass('err').show();
                    alert(result.response.description);
                }
            } else {
                $('#btn_status').text('Unknown error').addClass('err').show();
                alert('Unknown error');
            }
        },
        error: function (xhr) {
            $('button').prop('disabled', false);
            $('#btn_status').text('Server error').addClass('err').show();
            alert('Server error');
        }
    });
}
function changeButton() {
    $('button').prop('disabled', true);
    $('#btn_status').text('Changing button...').removeClass('ok err').show();
    $.ajax('/demo/changeMenuButton', {
        type: 'POST',
        data: { _auth: initData },
        dataType: 'json',
        success: function (result) {
            $('button').prop('disabled', false);
            if (result.response) {
                if (result.response.ok) {
                    $('#btn_status').html('Button changed!').addClass('ok').show();
                    Telegram.WebApp.close();
                } else {
                    $('#btn_status').text(result.response.description).addClass('err').show();
                    alert(result.response.description);
                }
            } else {
                $('#btn_status').text('Unknown error').addClass('err').show();
                alert('Unknown error');
            }
        },
        error: function (xhr) {
            $('button').prop('disabled', false);
            $('#btn_status').text('Server error').addClass('err').show();
            alert('Server error');
        }
    });
    setTimeout(function () {
        Telegram.WebApp.close();
    }, 50);
}
function byteLength(str) {
    if (window.Blob) {
        try { return new Blob([str]).size; } catch (e) { }
    }
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s += 2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--;
    }
    return s;
}

function sendText(spam) {
    var text = $('#text_field').val();
    if (!text.length) {
        return $('#text_field').focus();
    }
    if (byteLength(text) > 4096) {
        return alert('Text is too long');
    }
    var repeat = spam ? 10 : 1;
    for (var i = 0; i < repeat; i++) {
        Telegram.WebApp.sendData(text);
    }
}
function sendTime(spam) {
    var repeat = spam ? 10 : 1;
    for (var i = 0; i < repeat; i++) {
        Telegram.WebApp.sendData(new Date().toString());
    }
}
function webviewExpand() {
    Telegram.WebApp.expand();
}
function webviewClose() {
    Telegram.WebApp.close();
}
function requestLocation(el) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $(el).next('span').html('(' + position.coords.latitude + ', ' + position.coords.longitude + ')').attr('class', 'ok');
        });
    } else {
        $(el).next('span').html('Geolocation is not supported in this browser.').attr('class', 'err');
    }
    return false;
}
function requestVideo(el) {
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(function (stream) {
            $(el).next('span').html('(Access granted)').attr('class', 'ok');
        });
    } else {
        $(el).next('span').html('Media devices is not supported in this browser.').attr('class', 'err');
    }
    return false;
}
function requestAudio(el) {
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
            $(el).next('span').html('(Access granted)').attr('class', 'ok');
        });
    } else {
        $(el).next('span').html('Media devices is not supported in this browser.').attr('class', 'err');
    }
    return false;
}

Telegram.WebApp.onEvent('themeChanged', function () {
    $('#theme_data').html(JSON.stringify(Telegram.WebApp.themeParams, null, 2));
});

$('#main_btn').toggle(!!initDataUnsafe.query_id);
$('#with_webview_btn').toggle(!!initDataUnsafe.query_id && !initDataUnsafe.receiver);
// $('#data_btn').toggle(!initDataUnsafe.query_id || !initDataUnsafe.receiver);
$('#webview_data').html(JSON.stringify(initDataUnsafe, null, 2));
$('#theme_data').html(JSON.stringify(Telegram.WebApp.themeParams, null, 2));
$('#regular_link').attr('href', $('#regular_link').attr('href') + location.hash);
$('#text_field').focus();
if (initDataUnsafe.query_id && initData) {
    $('#webview_data_status').show();
    $.ajax('/demo/checkData', {
        type: 'POST',
        data: { _auth: initData },
        dataType: 'json',
        success: function (result) {
            if (result.ok) {
                $('#webview_data_status').html('Hash is correct').addClass('ok');
            } else {
                $('#webview_data_status').html(result.error).addClass('err');
            }
        },
        error: function (xhr) {
            $('#webview_data_status').html('Server error').addClass('err');
        }
    });
}
$('body').css('visibility', '');
Telegram.WebApp.MainButton
    .setText('CLOSE WEBVIEW')
    .show()
    .onClick(function () { webviewClose(); });

function toggleMainButton(el) {
    var mainButton = Telegram.WebApp.MainButton;
    if (mainButton.isVisible) {
        mainButton.hide();
        el.innerHTML = 'Show Main Button';
    } else {
        mainButton.show();
        el.innerHTML = 'Hide Main Button';
    }
}

function round(val, d) {
    var k = Math.pow(10, d || 0);
    return Math.round(val * k) / k;
}

function setViewportData() {
    $('.viewport_border').attr('text', window.innerWidth + ' x ' + round(Telegram.WebApp.viewportHeight, 2));
    $('.viewport_stable_border').attr('text', window.innerWidth + ' x ' + round(Telegram.WebApp.viewportStableHeight, 2) + ' | is_expanded: ' + (Telegram.WebApp.isExpanded ? 'true' : 'false'));
}
Telegram.WebApp.onEvent('viewportChanged', setViewportData);
setViewportData();