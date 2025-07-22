$(document).ready(function() {

    const container = $('.links-container');

    container.on('click', '.title-share-button', function(event) {
        event.preventDefault();
        const link = $(this).attr('link');
        if (isMobileDevice()) {
            shareViaWebAPI(link);
        } else {
            copyText(link);
        }
    });

    async function copyText(link) {
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copied to clipboard: " + link);
        } catch (err) {
            console.error(err);
        }
    }

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function shareViaWebAPI(link) {
        navigator.share({
            title: 'Share Link',
            text: '👋 - Check out this link:',
            url: link,
        }).then(() => {
            console.log('Link shared successfully');
        }).catch((error) => {
            console.error('Error sharing link:', error);
        });
    }

    function loadJSON(callback) {
        $.getJSON('./links.json', function(data) {
            callback(data);
        }).fail(function(jqxhr, textStatus, error) {
            console.error('Error loading JSON:', textStatus, error);
        });
    }

    function createLinks(links) {
        const container = $('.links-container');
        links.forEach(link => {
            const title = $('<a>', {
                class: 'title',
                href: link.url,
                id: link.name
            });

            const icon = $('<i>', {
                class: 'fab ' + link.icon + ' fa-2x'
            });

            const text = $('<p>').text(link.name);

            const shareButton = $('<div>', {
                class: 'title-share-button',
                link: link.url
            });

            if (link.shareButton) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '16');
                svg.setAttribute('height', '16');
                svg.setAttribute('viewBox', '0 0 16 16');
            
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('fill-rule', 'evenodd');
                path.setAttribute('clip-rule', 'evenodd');
                path.setAttribute(
                    'd',
                    'M10.6464 3.85347L11 4.20702L11.7071 3.49992L11.3536 3.14636L8.35355 0.146362H7.64645L4.64645 3.14636L4.29289 3.49992L5 4.20702L5.35355 3.85347L7.5 1.70702V9.49992V9.99992H8.5V9.49992V1.70702L10.6464 3.85347ZM1 5.49994L1.5 4.99994H4V5.99994H2V14.9999H14V5.99994H12V4.99994H14.5L15 5.49994V15.4999L14.5 15.9999H1.5L1 15.4999V5.49994Z'
                );
                path.setAttribute('fill', 'currentColor');
                svg.appendChild(path);
            
                shareButton.append(svg); // Hier wird der bestehende `shareButton` genutzt
            }
            title.append(icon);
            title.append(text);
            title.append(shareButton);
            container.append(title);
        });
    }

    loadJSON(function(response) {
        createLinks(response);
    });
});
