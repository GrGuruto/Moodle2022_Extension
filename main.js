year_season = get_season();

const parser = new DOMParser();

var cpath = location.pathname;


let uls = document.getElementsByTagName('ul');
var leftmenu = find_leftmenu(uls);
try{
    var left_color = window.getComputedStyle(leftmenu.children[0].children[0], null).getPropertyValue('color');
}catch(error){
    var left_color = 'error';
    console.log(error);
}



if (cpath == '/login/index.php'){

}else if (left_color == 'error'){

}else if (left_color == 'rgb(73, 80, 87)'){
    new Promise(resolve => {
        add_mycourses();
        resolve();
    })
    .then(() => {
        return new Promise(resolve => {
            add_due();
            resolve();
        })  
    })
    .then(() => {
        return new Promise(resolve => {
            setTimeout(() => {
                add_class_upper();
                resolve();
            }, 500);
        })  
    })
}else{
    new Promise(resolve => {
        add_mycourses();
        resolve();
    })
    .then(() => {
        return new Promise(resolve => {
            add_due();
            resolve();
        })  
    })
}

function add_due(){ //dueイベントを取得して左に書き込む
    fetch("https://2022.moodle.icu.ac.jp/my/")
    .then(res => res.text())
    .then(function(data){
        var doc_my = parser.parseFromString(data, "text/html");
        my_a = doc_my.getElementsByTagName('a');
        for (let i=0; i<my_a.length; i++){
            if ((my_a[i].innerText.indexOf('提出期限') !== -1) || (my_a[i].innerText.indexOf('due') !== -1)){
                if (my_a[i].href.indexOf('event') !== -1){
                    add_class_due(my_a[i].href)
                }
            }
        }  
    });
}

function add_class_due(url){
    fetch(url)
    .then(res => res.text())
    .then(function(data){
        const doc_event = parser.parseFromString(data, "text/html");
        subject = doc_event.title.split(':')[0]
        due = doc_event.getElementsByClassName('col-11')[0].innerText;
        due_split = due.split(' ');
        if (due_split[0] != 'Today,' && due_split[0] != 'Tomorrow,'){
            due_split[0] = due_split[0].slice(0,3) + '.';
        }
        if (due_split[2] != 'May'){
            due_split[2] = due_split[2].slice(0,3) + '.';
        }
        due = due_split.join(' ');
        classes = document.getElementsByClassName('media-body');
        remaining = get_time_remaining(url);
        for (let i=0; i<classes.length; i++){
            if (classes[i].innerText.indexOf(subject) !== -1){
                classes[i].innerText += `\nDue: ${due}\n${remaining} remaining`
                if (due.indexOf("Tomorrow")!==-1 || due.indexOf("Today")!==-1){
                    classes[i].style.color = "red";
                }
            }
        }
    })
}

function get_time_remaining(url){
    let i_time = url.indexOf('time=');
    let due_unix = url.slice(i_time+5, i_time+15);
    let now_unix = Math.floor(new Date().getTime() / 1000);
    let remaining_sec = due_unix - now_unix;
    let re_day = Math.floor(remaining_sec / 86400);
    let re_hour = Math.floor(remaining_sec % 86400 / 3600);
    let re_min = Math.floor(remaining_sec % 3600 / 60);
    let re_sec = remaining_sec % 60;
    if (re_day == 0){
        return `${re_hour}h${re_min}m`
    }else{
        return `${re_day}d${re_hour}h${re_min}m`
    }
}


function add_mycourses(){ //左の欄に追加されていないmy coursesを追加する
    fetch('https://2022.moodle.icu.ac.jp/?redirect=0')
    .then(res => res.text())
    .then(function(data){
        const doc_re = parser.parseFromString(data, "text/html");
        ccc = doc_re.getElementsByClassName('card-title text-center m-1');
        for (let i=0; i<ccc.length; i++){ //mycourseのカード
            child = ccc[i].children[0]
            classname = `${child.innerText.slice(0,6)}_${child.innerText.slice(-6,-1)}`;
            classlink = child.href;
            let uls = document.getElementsByTagName('ul');
            leftmenu = find_leftmenu(uls);
            lis_clone = make_clone(leftmenu, classlink, classname);
            lis = lis_clone[0];
            clone = lis_clone[1];
            add_class2menu(lis, classlink, classname, leftmenu, clone);
        }
    })
}

function find_leftmenu(uls){
    for (let i=0; i<uls.length; i++){ //左の欄のを見つける
        if (uls[i].children[0] !== undefined){
            if (uls[i].children[0].children[0] !== undefined){
                if (uls[i].children[0].children[0].href === 'https://2022.moodle.icu.ac.jp/my/'){
                    return uls[i]
                }
            }
        }
    }
}

function make_clone(leftmenu, classlink, classname){
    lis = leftmenu.children
    clone = lis[lis.length-1].cloneNode(true);
    clone_child = clone.children[0];
    clone_child.href = classlink;
    clone_child.dataset.key = classlink.replace('https://2022.moodle.icu.ac.jp/course/view.php?id=', '');
    clone_child.children[0].children[0].children[1].innerText = classname;
    return [lis, clone];
}

function add_class2menu(lis, classlink, classname, leftmenu, clone){
    for (let i=0; i<lis.length; i++){
        if (lis[i].children[0].href === classlink){
            return
        }else{
            continue
        }
    }
    if (classname.indexOf(year_season) !== -1){
        leftmenu.appendChild(clone);
    }
    
}



function add_class_upper(){ //下にあるmy coursesを上にコピーする
    let uls = document.getElementsByTagName('ul');
    ul_under = find_leftmenu(uls);
    lis_under = ul_under.children;
    ul_upper = find_leftmenu_up(uls);
    const current_course = document.title.split(' ')[1];
    const current_course_2 = document.title.split(':')[0];
    for (let i=lis_under.length-1; i>=0; i--){
        if(i>=5){
            clone_under = lis_under[i].cloneNode(true);
            clone_coursename = clone_under.children[0].children[0].children[0].children[1].innerText;
            if ((clone_coursename.indexOf(current_course) === -1) && (clone_coursename.indexOf(current_course_2) === -1)){
                ul_upper.prepend(clone_under);
            }
        }
    }
}




function find_leftmenu_up(uls){
    for (let i=0; i<uls.length; i++){ //左の欄の一個上を見つける
        if (uls[i].children[0] !== undefined){
            if (uls[i].children[0].children[0] !== undefined){
                if (uls[i].children[0].children[0].href === 'https://2022.moodle.icu.ac.jp/my/'){
                    return uls[i-1]
                }
            }
        }
    }
}

function get_season(){
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var season;
    if (4<=month && month<=7){
        season = 'S';
    }else if (8<=month && month<=11){
        season = 'A';
    }else{
        season = 'W';
    }
    if (1<=month && month<=3){
        year = year - 1;
    }
    var year_season = year.toString() + season;
    return year_season
}