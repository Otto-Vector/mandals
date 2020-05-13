
window.onload = init



/////задание глобальных переменных////////////////////////////////////////
var scene, camera, renderer, domEvents, controls

//база цветов//
const colors = ["#FFFFFF", "#E4388C", "#E4221B", "#FF7F00", "#FFED00", "#008739", "#02A7AA", "#47B3E7", "#2A4B9B", "#702283"]
//материал кубов
const cubeMaterial = (color_set) => new THREE.MeshBasicMaterial({color: colors[color_set] }) //базовый сборщик материи кубов
//размеры кубов
const cubeGeom = (size=1) => new THREE.CubeGeometry(size,size,size) //базовый сборщик геометрии кубов

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function init(value_init, re_input) {
  //окрашиваем кнопки визуализации цветов
  let palitra = document.querySelectorAll(".palitra div")
    for (var i = 0; i < palitra.length; i++)
      palitra[i].style.background = colors[i]


  ///////////////////////////////////////////////////////////////////////////
  //добавил сцену
  scene = new THREE.Scene()
  scene.background = new THREE.Color( "white" ) //задал сцене задний фон

  //настроил параметры камеры
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 300 )
  camera.lookAt( 0, 0, 0 ) //смотреть в центр координат

  //выбрал рендер
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( window.innerWidth-4, window.innerHeight-4 ) //отнял по 4 пикселя, потому что появляется прокрутка
  //-40 для панели кнопок цвета

  //удаление предыдущего созданного объекта canvas
  let canv = document.getElementsByTagName("canvas")
  //если init() запущен в первый раз, то не удалять
  if (+value_init) document.body.removeChild(canv[0])

  //добавление скрипта к документу в тег
  document.body.appendChild( renderer.domElement )
  //при динамическом изменении размера окна
  window.addEventListener('resize', onWindowResize, false)

  ///////////МАНИПУЛЯЦИЯ СЦЕНОЙ///////////////////////////
  // также активация внутри функции render() и onwindowresize() строкой controls.update()
  controls = new THREE.OrbitControls (camera, renderer.domElement)
  controls.minDistance = 2
  controls.maxDistance = 299

  //////////////////////////BEGIN/////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  //  задаёт разные мандалы
  // 4 - на квадрат (по три)                    +
  // 5 - на 6 пластин (цветок шахматный 1вар)   +
  // 6 - на 6 пластин (цветок по три)           +
  // 7 - на 6 пластин (цветок шахматный 2вар)   +
  // 8 - на квадрат шахматный расчёт (1вар)     +
  // 9 - на квадрат шахматый расчёт (2вар)      +
  var value_default = (+value_init) ? +value_init : 4 //проверка на первый запуск init() (по умолчанию 4-ый вариант)

  //////функция для проверки различных значений value_default (прототипирована в Number)////////
  Number.prototype.true_of = function (...props) {
    return props.indexOf(+this) != -1 }

  if (value_default.true_of(5,6,7)) camera.position.set( -95, 95, 95 ) //позиция камеры для трёхмерного цветка
  if (value_default.true_of(4)) camera.position.set( 0, 0, 80 ) //позиция камеры для квадратов
  if (value_default.true_of(8,9)) camera.position.set( 0, 0, 120 ) //позиция камеры для квадратов

   //ввод цифр для расчёта мандалы
  let input_string = prompt ( "Введите значение для создания мандалы",
                              //также вводится предыдущее значение (а при первом вводе - пустое поле)
                              (+value_init) ? re_input : ""
                            )
  let test_string = "01234567890" //тестовая строка на которую заменяется при неверном вводе
  // let test_string = "01234567890многоНоного Буковокдля - проверкиА0даптивностиитп" //тестовая строка на которую заменяется при неверном вводе


  let modification_to_normal = function (str, test) {

    str = !str ? modification_to_normal(test) : str.replace(/\s/g, '') //убираем пробелы из строки

    return  !str ? //проверка str на значения приводящие к false
      modification_to_normal(test) : //если ввод пустой то присваивается значение по умолчанию //и (на всякий случай) обрабатывается
        str
          .slice(0,30) //обрезание более 30ти символов
          .toLowerCase() //убираем верхний регистр
  }

  input_string = modification_to_normal(input_string, test_string)

  //////////////////////////////////////////////////////////////////////////////////////////////
  ///DOM////////////////////////
  ///title
  title = document.querySelectorAll("header.title");
  title[0].innerHTML = input_string; //вывод в заголовок обработанного текста

  //select
  document.querySelector('#select_mandala_type').onchange = function() {init(+this.value, input_string)}

  ///////блок адаптации букв в цифровой код////////////////////////
  //символы расположены строго по таблице (удачно получилось то, что нужен всего один пробел)
  let simbols_static = "abcdefghijklmnopqrstuvwxyz абвгдеёжзийклмнопрстуфхцчшщъыьэюя"

  //прототипируем в объект String,
  //чтобы применять к разным переменным строк
  //возвращает число
  String.prototype.simbols_num_adapter = function (simbol) {
    return (!isNaN(simbol)) ? //если проверяемый символ является числом
              +simbol : //то выводим его как число (здесь "плюс" это аналог parseInt())
                this.indexOf(simbol)%9+1 // если нет, то применяем число в соответствии с таблицей Урсулы
               //если символ отсутствует (indexOf возвращает -1), то по логике (+1) присваивается 0
    }
  //////////////////////////////////////////////////////////
  //прототипирование функции перевода строки в числа (возвращает массив чисел)
  String.prototype.to_num = function () {
    let fn_nums = [0, []]

    for (let i=1; i <= this.length; i++) {
      fn_nums[i] = simbols_static.simbols_num_adapter(this[i-1]) //применение функции адаптации из прототипа
      fn_nums[0] += fn_nums[i] //сумма для цвета числа в центре
    }
    //фибоначи на нулевой элемент суммы чисел
    fn_nums[0] = to_one_fibbonachi_digit(fn_nums[0])

    return fn_nums
  }
  ////////////////////////////////////////////////////////////////////////////////////
  ///////////       ВЫБОР АЛГОРИТМА РАСЧЁТА              ////////////////////////////
  //высчитываем двумерный массив цветов для куба
  let plane_of_colors = []
  if (value_default.true_of(4,6))
    plane_of_colors = plane_square_3x_algorithm( input_string.to_num() )

  if (value_default.true_of(5,7,8,9))
    plane_of_colors = chess_algorithm( input_string.to_num()
                                           ,value_default.true_of(7,9) //передается boolean для второго расчёта оси
                                          )
  ////////////////////////////////////////////////////////////////////////////////
  //добавляем ось//
  
  //////////сборка осей по value_default направлениям //////////
  function axis_visual (input_nums_fn) {
    let axis_fn = []
    //нулевой куб в центре оси

    axis_fn[0] = axis_construct( 0,0,0, input_nums_fn[0] )

    let color_n
    for (let i = 1; i < input_nums_fn.length; i++) {
      color_n = input_nums_fn[i]

      if ( value_default.true_of(4,5,6,7,8,9) ) axis_fn.push( axis_construct( i,0,0, color_n) )
      if ( value_default.true_of(4,5,6,7,8,9) ) axis_fn.push( axis_construct( 0,i,0, color_n) )

      if ( value_default.true_of(4,5,6,7,8,9) ) axis_fn.push( axis_construct( -i,0,0, color_n) )
      if ( value_default.true_of(4,5,6,7,8,9) ) axis_fn.push( axis_construct( 0,-i,0, color_n) )

      if ( value_default.true_of(5,6,7) ) axis_fn.push( axis_construct( 0,0,i, color_n) )
      if ( value_default.true_of(5,6,7) ) axis_fn.push( axis_construct( 0,0,-i, color_n) )
    }

  return axis_fn
  }

  ///////рабочий вариант обводки мандалы////////////////////////

  function border_visual (input_nums_fn) {
    //перменные для обводки мандалы
    let border_coordin = input_nums_fn.length
    let border_color = input_nums_fn[0] //присваивается цвет нулевой клетки
    let border_fn = [] //массив для элементов обводки мандалы
    let border_timeout = 0 //переменная для анимации отрисовки обводки
    
    if ( value_default.true_of(4,8,9) )
      for (let i = -border_coordin; i < border_coordin; i++) {

        setTimeout(function(){ //анимация бордера
          border_fn.push(
            axis_construct( -border_coordin, i, 0, border_color), //левая
            axis_construct( i, border_coordin, 0, border_color), //верхняя
            axis_construct( border_coordin, -i, 0, border_color), //правая
            axis_construct( -i,-border_coordin, 0, border_color) //нижняя
          )
        },
          border_timeout = border_timeout+50) //прирост времени появления следуюдего элемента

      }

    return border_fn
  }


  ////////пластина кубов/////////////

  function plain_x_cube_visual (plane_of_colors_fn) {

    let plain_x_cube_fn = []
    //отрисовка панелей
    for (let y = 1; y < plane_of_colors_fn[0].length; y++)
      for (let x = 1; x < plane_of_colors_fn[0].length; x++) {

        //назначение цвета в соответствии с цветоцифрами, вычисленными по примененному алгоритму
        color_n = plane_of_colors_fn[y][x] 

        if (value_default.true_of(4,5,6,7,8,9))
          plain_x_cube_fn.push( plane_construct( y, x, 0, color_n) )

        if (value_default.true_of(5,6,7))
          plain_x_cube_fn.push( plane_construct( y, 0, x, color_n) )

        if (value_default.true_of(5,6,7))
          plain_x_cube_fn.push( plane_construct( 0, -y, x, color_n) )

        if (value_default.true_of(4,5,6,7,8,9))
          plain_x_cube_fn.push( plane_construct( -y, -x, 0, color_n) )

        if (value_default.true_of(5,6,7))
          plain_x_cube_fn.push( plane_construct( -y, 0, -x, color_n) )

        if (value_default.true_of(5,6,7))
          plain_x_cube_fn.push( plane_construct( 0, y, -x, color_n) )

        if (value_default.true_of(4,8,9))
          plain_x_cube_fn.push( plane_construct( -x, y, 0, color_n) )

        if (value_default.true_of(4,8,9))
          plain_x_cube_fn.push( plane_construct( x, -y, 0, color_n) )
      }

    return plain_x_cube_fn
    }



  //задание объектов\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  //// они все нужны для того, чтобы можно было к ним потом обращаться и манипулировать
  let axis = axis_visual (plane_of_colors[0]) //объявляем двумерный массив для оси
  let plain_x_cube = plain_x_cube_visual (plane_of_colors) //пластины между осями
  let border = border_visual (plane_of_colors[0]) //массив для элементов обводки мандалы

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  ////анимация объектов////////////////////
  animate()

  function animate() {

    requestAnimationFrame( animate )
    render()

  }

  function render() {

    controls.update() //манипуляция со сценой
    // console.log(camera.position)
    renderer.render( scene, camera )


    }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ///МАНИПУЛЯЦИИ С ПРИМЕНЕНИЕМ И ОСЛЕЖИВАНИЕМ СОБЫТИЙ НАЖАТИЯ НА ОБЪЕКТЫ И КНОПКИ НА БОКОВОЙ ПАНЕЛИ///
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // //функция исчезания кубов в найденых в domEvents
  var color_select_unvisibler = (color) => {

    //функция перебора массива с отслеживанием нажатых кнопок
    function foreach_visibler(arr) { //в ф-цию передаем массив
      arr.forEach(function(item) { //перебираем массив
          if (color == "#") item.visible = false //все искомые элементы становятся невидимыми
          if (color == "@" ||
              color == item.colornum ) item.visible = !item.visible //смена видимости на невидимость
          if (color == "A") item.visible = true //все искомые элементы становятся видимыми
        })
    }

    //перебор по осям
    foreach_visibler(axis)
    //перебор по плоскостям
    foreach_visibler(plain_x_cube)

    //только для бордера//
    if (color == "B") border.forEach( function(entry) { 
      entry.colornum = (entry.colornum == 9 ) ? 0 : ++entry.colornum //перебор цвета в замкнутом цикле 9 и смена значения
      entry.material.color.set(colors[entry.colornum]) //присвоение значения цвета
      })
    }

  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
  /////////////// применил отслеживание по клику с помощью библиотеки threex.domevents.js /////////////
  var domEvents = new THREEx.DomEvents(camera, renderer.domElement)

  //функция отслеживания событий для элементов THREE.js////
  function mousedown_listener(arr) {
    arr.forEach( function(entry) { 
      domEvents.addEventListener( entry, 'mousedown', (event)=> {color_select_unvisibler(event.target.colornum)})
    })
  }

  //назначил отслеживание событий на каждую ось
  mousedown_listener(axis)
  //назначил отслеживание событий на каждую плоскость
  mousedown_listener(plain_x_cube)


  //отслеживание нажатия кнопок боковой панели
  for (var i = 0; i < palitra.length; i++) {
    palitra[i].onmousedown = (event) => color_select_unvisibler(event.target.innerHTML) //передача в функцию визуального содержимого кнопки
  }

  //////////////////////////////////////////

} //init() end bracket

//////////////////////////////////////////////////////////////////////////////////
/////функция изменения центровки камеры при изменении размера экрана///////////////
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth-4, window.innerHeight-4)

  controls.update() //для сохранения пропорций при динамическом изменении ширины экрана

}

/////////////////////////////////////////////////////////
// универсальная функция числа фибоначчи/////////////////
const to_one_fibbonachi_digit = function (digit) {

    let summ = 
      Math.abs(digit). //на всякий случай перевод из отрицательного в абсолютное значение
      toString().     //перевод числа в строку для разъединения многозначных чисел
      split('').     //перевод строки в массив
      map(Number).  //перевод массива символов в массив чисел
      reduce((sum,n) => sum+n) //перебор массива с подсчётом суммы чисел

    return (summ > 9) ? to_one_fibbonachi_digit(summ) : summ //замыкание функции при многозначной сумме

  }

//////////функция конструктора объектов/////////////////////////////////////////////////////////////
///передаются координаты и номер цвета
const axis_construct = plane_construct = function(x, y, z, colornum) {

    let cubus = new THREE.Mesh(cubeGeom(), cubeMaterial(colornum)) //функции определены перед init()
    cubus.position.set(x,y,z) // тут очевидно устанавливается позиция объекта
    cubus.colornum = colornum //идентификатор для отбора объектов по значению
    scene.add(cubus) //визуализация полученного объекта

    return cubus

  }


  ////////пластина мандалы из кубов по первому алгоритму (Юлин вариант)////////////////////////////
  let plane_square_3x_algorithm = input_nums_fn => {
    //задаём основной цифро-световой массив мандалы
    let matrix = []
    //сначала назначаем ось по горизонтали
      matrix[0] = input_nums_fn
    //и зеркально по вертикали
    for (let i=1; i <= input_nums_fn.length; i++) {
      matrix[i] = [matrix[0][i]]
    }

    //высчитываем мандалу на основе заданных осей (массивы считаются от 1, потому что -1)
    for (let y=1; y < input_nums_fn.length; y++)
      for (let x=1; x < input_nums_fn.length; x++) {

        let fibbo_number = to_one_fibbonachi_digit( matrix[y-1][x] +
                                                    matrix[y][x-1] +
                                                    matrix[y-1][x-1] )

        matrix[y].push(fibbo_number)
      }

    return matrix

  }

  ////////алгоритм сбора мандалы по шахматной схеме/////////////////////////////
  let chess_algorithm = (input_nums_fn,val) => {

    //первый вариант

    let axis_fn = [ //создаём базис отсчёта сумма посередине и по краям
      input_nums_fn[0], //это уже посчитанная заранее сумма вписанная в нулевой элемент
      ...input_nums_fn.map((n,i,arr) => arr[arr.length-1-i]), //разворот вводного значения, соотвественно сумма из нулевого значения становится в середине
      ...input_nums_fn.slice(1), //обрезаем повторную сумму
      input_nums_fn[0] //и снова сумма в конце
      ]

    //второй вариант если true
    if (val) 
    axis_fn = [
      ...input_nums_fn,input_nums_fn[0],
      ...input_nums_fn.map((n,i,arr) => arr[arr.length-1-i]) //аналог reverse() без изменения массива
      ]

    let matrix = axis_fn.map(n => n = axis_fn.map( n => 0)) // создаём двумерную матрицу на нулях на основе размера базиса

    axis_fn.forEach( (n,i) => matrix[i][i] = n) // вписываем косую "ось" (базис) в матрицу подсчёта

      //сначала расчёт диагонали в сторону уменьшения
      for (let i=1; i < axis_fn.length; i++)
        for (let j=i; j < axis_fn.length; j++)

            matrix[j][j-i] =
              to_one_fibbonachi_digit ( //складывается в шахматном порядке первая/четная диагональ по две цифры
                                        matrix[j][j-i+1]
                                        + matrix[j-1][j-i]
                                        + ((i%2==0) ? matrix[j-1][j-i+1] : 0) //нечетные диагонали - по три цифры
                                        )

      //расчёт диагонали в сторону увеличения
       for (let i=0; i < axis_fn.length; i++)
        for (let j=0; j < axis_fn.length-1-i; j++)

            matrix[j][j+i+1] = 
              to_one_fibbonachi_digit ( //складывается в шахматном порядке первая/четная диагональ по две цифры
                                        matrix[j][j+i]
                                        + matrix[j+1][j+i+1]
                                        + ((i%2==0) ? matrix[j+1][j+i] : 0) //нечетные диагонали - по три цифры
                                        )

    // console.log(matrix)

    return matrix.reverse()

  }

