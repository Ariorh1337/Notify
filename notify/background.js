/*
Создание бейджика c временем
chrome.browserAction.setBadgeText({ text: '00:00'})

Изменение цвета
chrome.browserAction.setBadgeBackgroundColor({ color: 'blue'});
*/
var buttons = { type: '', link: '', id: ''};

chrome.storage.sync.get(['event_id'], (result) => {
    if (result.event_id == undefined) {
        chrome.storage.sync.set({ 'event_id': new Array()});
    }
})

setTimeout(() => {
	setInterval(() => {
        notify_check();
    }, 60000)
}, ((Math.floor(Number(new Date()) / 60000) * 60000 + 60000) - Number(new Date())));

var replyBtnClick = (id, btn) => {
    if (btn == 0) {
        memory('more_time', buttons.id);
    } else if (btn == 1) {
        if (buttons.type == 'link') {
            if (buttons.link !== '') {
                (buttons.link.indexOf('http') == -1) ? buttons.link = 'https' + buttons.link : false;
                chrome.tabs.create({ url: buttons.link});
            }
        }
        
    }
    buttons.type = '';
    buttons.link = '';
    buttons.id = '';
};

chrome.notifications.onButtonClicked.addListener(replyBtnClick);

function create_notification (type, id, prior, title, text) {
    let opt = {
        type: "basic",
        title: title,
        message: text,
        iconUrl: `/img/bell_${prior}.png`,
        buttons: [{title: "Отложить"}],
        requireInteraction: true
    }

    if (type == 'text') {
        opt.buttons.push({title: "Ок"})
        buttons.type = type;
        buttons.link = '';
    } else if (type == 'link') {
        opt.buttons.push({title: "Открыть"});
        buttons.type = type;
        buttons.link = text;
    }

    buttons.id = id;

    chrome.notifications.create('', opt);
} //create_notification ('link', 0, grey, 'test', 'https://google.com');

function notify_check() {
    console.log(new Date());
    memory('read').then((storage) => {
        storage.relevant.forEach((relevant) => {
            if (relevant.date_time <= Number(new Date())) {
                if (relevant.link == '' && relevant.text !== '') {
                    create_notification ('text', relevant.id, relevant.priority, relevant.name, relevant.text);
                } else if (relevant.link !== '' && relevant.text == '') {
                    create_notification ('link', relevant.id, relevant.priority, relevant.name, relevant.link);
                }
                memory('m2_expired', relevant);
            }
        });
        storage.expired.forEach((expired) => {
            if (expired.date_time > Number(new Date())) {
                memory('m2_relevant', expired);
            }
        });
    });
}

//Ничего интересного дальше

async function memory (command = 'read', element = {}) {
    //Получаем сохраненные в хранилище эвенты
    let relevant = new Promise( (resolve) => {
		chrome.storage.sync.get(['relevant'], (result) => {
            if (result.relevant == undefined) {
                resolve(new Array());
            } else {
                resolve(result.relevant);
            }
		})
    });

    let expired = new Promise( (resolve) => {
		chrome.storage.sync.get(['expired'], (result) => {
            if (result.expired == undefined) {
                resolve(new Array());
            } else {
                resolve(result.expired);
            }
		})
    });

    let id = new Promise( (resolve) => {
        chrome.storage.sync.get(['event_id'], (result) => { 
            resolve(result.event_id.length);
        })
    });

    //Вызываем отрисовку
    let relevant_draw = await relevant;
    let expired_draw = await expired;
    let id_draw = await id;
    let now = Number(new Date());

   	if (command == 'read' && JSON.stringify(element) == '{}') {
        console.log('read');
        return result = { relevant : relevant_draw, expired : expired_draw }
	} else if (command == 'read' && JSON.stringify(element) !== '{}') {
        console.log('read S');
        let result = {};
        relevant_draw.forEach((line) => {
            if (Number(line.id) === Number(element)) {
                result = line;
            }
        });
        expired_draw.forEach((line) => {
            if (Number(line.id) === Number(element)) {
                result = line;
            }
        });
        return result;
	} else if (command == 'add' && element !== {}) {
        console.log('add');
		if (element.date_time > now) {
            console.log('relevant');
            element.id = id_draw + 1;
			relevant_draw.push(element);
			chrome.storage.sync.set({ relevant: relevant_draw});
		} else if (element.date_time < now) {
            console.log('expired');
            element.id = id_draw + 1;
			expired_draw.push(element);
			chrome.storage.sync.set({ expired: expired_draw});
        }
        chrome.storage.sync.set({ 'event_id' : new Array(element.id)});
	} else if (command == 'remove' && element !== {}) {
        console.log('remove');
		relevant_draw.forEach((line, index) => {
            if (Number(line.id) === Number(element)) {
                relevant_draw.splice(index, 1);
            }
        });
        chrome.storage.sync.set({ relevant: relevant_draw});

        expired_draw.forEach((line, index) => {
            if (Number(line.id) === Number(element)) {
                expired_draw.splice(index, 1);
            }
        });
        chrome.storage.sync.set({ expired: expired_draw });
	} else if (command == 'm2_expired' && element !== {}) {
        console.log('m2_expired');
		relevant_draw.forEach((line, index) => {
            if (Number(line.id) === Number(element.id)) {
                relevant_draw.splice(index, 1);
            }
        });
        chrome.storage.sync.set({ relevant: relevant_draw});

		expired_draw.push(element);
		chrome.storage.sync.set({ expired: expired_draw});
	} else if (command == 'm2_relevant' && element !== {}) {
        console.log('m2_relevant');
		relevant_draw.push(element);
		chrome.storage.sync.set({ relevant: relevant_draw});

		expired_draw.forEach((line, index) => {
            if (Number(line.id) === Number(element.id)) {
                expired_draw.splice(index, 1);
            }
        });
        chrome.storage.sync.set({ expired: expired_draw });
	} else if (command == 'more_time' && element !== {}) {
        console.log('more_time');
		relevant_draw.forEach((line) => {
            if (Number(line.id) === Number(element)) {
                line.date_time += 5 * 60 * 1000;
            }
        });
        chrome.storage.sync.set({ relevant: relevant_draw});

        expired_draw.forEach((line) => {
            if (Number(line.id) === Number(element)) {
                line.date_time = now + (((Math.floor(now / 60000) * 60000 + 60000) - now) + 4 * 60 * 1000);
                memory('m2_relevant', line);
            }
        });
	}
}