document.addEventListener('DOMContentLoaded', () => {
    start();
});

async function start() {
    //Переход в настройки
    document.getElementById('settings').onclick = () => {
        window.location.href = window.location.origin + '/popup/settings.html';
    }

    //Переход в добавление нового эвента
    document.getElementById('event').onclick = () => {
        window.location.href = window.location.origin + '/popup/new_event.html';
    }

    //Получаем сохраненные в хранилище эвенты
    let storage = await memory();
    html_draw('relevant', storage.relevant);
    html_draw('expired', storage.expired);

    //Удаление эвентов
    document.getElementsByName('remove').forEach((element) => {
        element.onclick = (click) => {
            memory('remove', click.path[click.path.length - 8].parentElement.id).then(() => {
                html_clear();
                start();
            });
        }
    });

    document.getElementsByName('edit').forEach((element) => {
        element.onclick = (click) => {
            window.location.href = window.location.origin + '/popup/new_event.html?id=' + click.path[click.path.length - 8].parentElement.id;
        }
    });

    document.getElementsByName('time').forEach((element) => {
        element.onclick = (click) => {
            let line = click.path[click.path.length - 8].parentElement;
            memory('more_time', line.id).then(() => {
                html_clear();
                start();
            })
            //перенос на 5 минут
        }
    });
    
}

function html_draw(table = '', events = []) {
    if (events.length > 0) {
        //HTML добавляемого эвента
        var event_line = (title, id, date, name, prior) => `<tr title="${title}" id="${id}"><td style="border-inline-start: 20px dotted ${prior};">${date}</td><td colspan="2">${name}</td><td><button title="отложить" name="time"><img src="/popup/svg/time.svg"></button><button title="изменить" name="edit"><img src="/popup/svg/pencil.svg"></button><button title="удалить" name="remove"><img src="/popup/svg/remove.svg"></button></td></tr>`;

        //Сортируем получаемые эвенты в порядке возрастания
        if (table == 'relevant') {
            events = events.sort( (a, b) => { return (a.date_time - b.date_time) });
        } else if (table == 'expired') {
            events = events.sort( (a, b) => { return (b.date_time - a.date_time) });
        }
        //Рисуем в таблицу все нужные элементы
        events.forEach((event) => {
            let title = (event.link == '') ? event.text : event.link;
            let date = new Date(event.date_time).toLocaleString().replace(/.[0-9]+, /i,' ').slice(0, -3);
            let element = document.createElement('tr');
            document.querySelector(`body > #${table} > tbody`).append(element);
            element.outerHTML = event_line(title, event.id, date, event.name, event.priority);
        });
        
        //Это что бы кнопочки красиво выезжали не обрезая td у других строк
        document.querySelectorAll('table > tbody > tr').forEach((element) => {
            element.onmouseover = (event) => {
                if (event.path[event.path.length - 7].children[1]) {
                    event.path[event.path.length - 7].children[1].setAttribute('colspan','1');
                }
            }
            element.onmouseout = (event) => {
                if (event.path[event.path.length - 7].children[1]) {
                    event.path[event.path.length - 7].children[1].setAttribute('colspan','2');
                }
            }
        });
    } else {
        let element = document.createElement('tr');
        document.querySelector(`body > #${table} > tbody`).append(element);
        element.outerHTML = '<tr><td style="text-align: center;">There is nothing to show here</td></tr>';
    }
}

function html_clear() {
    document.querySelectorAll('table > tbody > tr').forEach((line) => {
        line.remove();
    });
}