document.getElementById('settings').onclick = () => {
    window.location.href = window.location.origin + '/popup/settings.html';
}

document.getElementById('cancel').onclick = () => {
    window.location.href = window.location.origin + '/popup/main.html';
}

if (window.location.search !== '') {
    var id = window.location.search.match(/[0-9]+/i)[0];
    memory('read', id).then((result) => {
        //Name
        document.getElementById('name').value = result.name;

        //Text-Link
        if (result.text !== '' && result.link == '') {
            document.getElementsByName('text-link')[0].checked = 'checked'
            document.getElementById('text').value = result.text;
        } else if (result.text == '' && result.link !== '') {
            document.getElementsByName('text-link')[1].checked = 'checked'
            document.getElementById('text').value = result.link;
        }

        //Time
        var time = new Date(result.date_time);
        time = `${time.getFullYear()}-${
            String(time.getMonth() + 1).length == 2 ? (time.getMonth() + 1) : '0' + (time.getMonth() + 1)}-${
            String((time.getDate() > 9) ? time.getDate() : '0' + time.getDate())}T${
            String(time.getHours()).length == 2 ? time.getHours() : '0' + time.getHours()}:${
            String(time.getMinutes()).length == 2 ? time.getMinutes() : '0' + time.getMinutes()}`;
        document.getElementById('time').setAttribute('value', time);

        //Priority
        document.querySelector(`.container > input[value="${result.priority}"]`).checked = 'checked';
    });
} else {
	var time = new Date(Number(new Date()) + (60 * 60 * 1000));
    time = `${time.getFullYear()}-${
        String(time.getMonth() + 1).length == 2 ? (time.getMonth() + 1) : '0' + (time.getMonth() + 1)}-${
        String((time.getDate() > 9) ? time.getDate() : '0' + time.getDate())}T${
        String(time.getHours()).length == 2 ? time.getHours() : '0' + time.getHours()}:00`;
    //yyyy-mm-ddThh:mm - формат даты ^
    document.getElementById('time').setAttribute('value', time);
}

document.getElementById('add').onclick = () => {
    var link = '', text = '', priority = 'white';
    document.querySelectorAll('input[type="radio"][name="text-link"]').forEach((elm) => {
        if (elm.checked == true) {
            if (elm.value == 'link') {
                link = document.getElementById('text').value;
            } else {
                text = document.getElementById('text').value;
            }
        }
    });
    document.querySelectorAll('input[type="radio"][name="priority"]').forEach((elm) => {
        if (elm.checked == true) {
            priority = elm.value;
        }
    });

    var new_elm = {
        name: document.getElementById('name').value,
        date_time: Number(new Date(document.getElementById('time').value)),
        link: link,
        text: text,
        priority: priority
    };
    memory('add', new_elm).then(() => {
        if (window.location.search !== '') {
            var id = window.location.search.match(/[0-9]+/i)[0];
            memory('remove', id);
        }
    
        window.location.href = window.location.origin + '/popup/main.html';
    });
}