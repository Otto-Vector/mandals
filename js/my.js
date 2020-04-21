
window.onload = init


/////задание глобальных переменных////////////////////////////////////////
var scene, camera, renderer, domEvents,controls

var value_default = 4 //задаёт две разные мандалы (пока на 3 (1) и на 6 (2) пластин) 4 (3) - на квадрат

//база цветов//
const colors = ["#FFFFFF", "#E4388C", "#E4221B", "#FF7F00", "#FFED00", "#008739", "#02A7AA", "#47B3E7", "#2A4B9B", "#702283"]
//материал кубов
const cubeMaterial = (color_set) => new THREE.MeshBasicMaterial({color: colors[color_set] }) //базовый сборщик материи кубов
//размеры кубов
const cubeGeom = (size=1) => new THREE.CubeGeometry(size,size,size) //базовый сборщик геометрии кубов

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function init() {

  //окрашиваем кнопки визуализации цветов
  let palitra = document.querySelectorAll(".palitra div")
    for (var i = 0; i < palitra.length; i++)
      palitra[i].style.background = colors[i]


  ///////////////////////////////////////////////////////////////////////////
  //добавил сцену
  scene = new THREE.Scene()
  scene.background = new THREE.Color( "white" ) //задал сцене задний фон

  //настроил параметры камеры
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 )
  if (value_default == 6) camera.position.set( -45, 45, 45 ) //позиция камеры для 6
  if (value_default == 3) camera.position.set( -45, -45, -45 ) //позиция камеры для 3
  // if (value_default == 4) camera.position.set( 0, 0, 45 ) //позиция камеры для 4
  camera.lookAt( 0, 0, 0 ) //смотреть в центр координат

  //выбрал рендер
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( window.innerWidth-40, window.innerHeight-4 ) //отнял по 4 пикселя, потому что появляется прокрутка
  //-40 для панели кнопок цвета

  //добавление скрипта к документу в тег
  document.body.appendChild( renderer.domElement )
  //при динамическом изменении размера окна
  window.addEventListener('resize', onWindowResize, false)

  ///////////МАНИПУЛЯЦИЯ СЦЕНОЙ
  // также активация внутри функции render() и onwindowresize() строкой controls.update()
  // controls = new THREE.OrbitControls (camera, renderer.domElement)
  // controls.minDistance = 1
  // controls.maxDistance = 80

  //////////////////////////BEGIN/////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
   //ввод цифр для расчёта мандалы
  let input_string = prompt("Введите слова и цифры", '')
  let test_string = "0123456789" //тестовая строка на которую заменяется при неверном вводе

  let modification_to_normal = function (str, test) {
    str = !str ? //проверка str на значения приводящие к false 
      test : //если ввод пустой то присваивается значение по умолчанию
        str.slice(0,30) //обрезание более 30ти символов
          .replace(/\s/g, '') //убираем пробелы из строки
            .toLowerCase() //убираем верхний регистр

    return !str ? modification_to_normal(str, test) : str //повторная проверка после убирания пробелов либо замыкание либо вывод результата
  }

  input_string = modification_to_normal(input_string, test_string)


  console.log(input_string)

  if (value_default == 4) camera.position.set( 0, 0, 35 + input_string.length*3 ) //позиция камеры для 4

  ///////блок адаптации букв в цифровой код////////////////////////
  //символы расположены строго по таблице (удачно получилось то, что нужен всего один пробел)
  let simbols_static = "abcdefghijklmnopqrstuvwxyz абвгдеёжзийклмнопрстуфхцчшщъыьэюя"
  //прототипируем в объект String, чтобы применять к разным переменным строк
  //возвращает число
  String.prototype.simbols_num_adapter = function (simbol) {
    return (!isNaN(simbol)) ? //если проверяемый символ является числом
              parseInt(simbol) : //то выводим его как число
                this.indexOf(simbol)%9+1 // если нет, то применяем число в соответствии с таблицей Урсулы
               //если символ отсутствует (indexOf возвращает -1), то по логике последней строки присваивается 0
    }
  //////////////////////////////////////////////////////////
  //прототипирование функции перевода строки в числа (возвращает массив чисел)
  String.prototype.to_num = function () {
    let fn_nums = [0, []]

    for (let i=1; i <= this.length; i++) {
      fn_nums[i] = simbols_static.simbols_num_adapter(this[i-1]) //применение функции адаптации из прототипа
      fn_nums[0] += fn_nums[i] //сумма для цвета числа в центре
    }
    //фибоначи на нулевой элемент
    fn_nums[0] = to_one_fibbonachi_digit(fn_nums[0])

    return fn_nums
  }

  //перевод строки в массив чисел для корректных подсчётов
  let input_nums = input_string.to_num()

  console.log(input_nums)
////////////////////////////////////////////////////////////////////////////////
  //добавляем ось//

  //объявляем двумерный массив для оси
  let axis = []
  for (let i = 0; i < 20; i++) axis[i] = []

  //нулевой куб в центре оси
  axis[0][0] = axis_construct(0,0,0, input_nums[0])

  
  //перменные для обводки мандалы
  let border_coordin = input_string.length+1
  let border_color = input_nums[0]
  
  //сборка осей по value_default направлениям //
  let color_n, arr_index
  for (let i = 1; i <= input_string.length; i++) {
    color_n = input_nums[i]
    arr_index = 0

    if ( value_default == 3 || value_default == 4 || value_default == 6) axis[arr_index++].push( axis_construct( i,0,0, color_n) )
    if ( value_default == 3 || value_default == 4 || value_default == 6) axis[arr_index++].push( axis_construct( 0,i,0, color_n) )
    if ( value_default == 6 || value_default == 4 ) axis[arr_index++].push( axis_construct( -i,0,0, color_n) )
    if ( value_default == 6 || value_default == 4 ) axis[arr_index++].push( axis_construct( 0,-i,0, color_n) )

    if ( value_default == 3 || value_default == 6 ) axis[arr_index++].push( axis_construct( 0,0,i, color_n) )
    if ( value_default == 6 ) axis[arr_index++].push( axis_construct( 0,0,-i, color_n) )

    //пока рабочий вариант обводки мандалы
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( i, border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( i,-border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( -i, border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( -i, -border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( -border_coordin, i, 0, border_color) )
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( border_coordin, i, 0, border_color) )
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( border_coordin,-i, 0, border_color) )
    if ( value_default == 4 ) axis[arr_index++].push( axis_construct( -border_coordin,-i, 0, border_color) )
  }
    //допиливание обводки (рабочий вариант)
    if ( value_default == 4 ) axis[6].push( axis_construct( border_coordin, border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[7].push( axis_construct( border_coordin, -border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[8].push( axis_construct( -border_coordin, border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[9].push( axis_construct( -border_coordin, -border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[10].push( axis_construct( 0, border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[11].push( axis_construct( 0, -border_coordin, 0, border_color) )
    if ( value_default == 4 ) axis[12].push( axis_construct( -border_coordin,0, 0, border_color) )
    if ( value_default == 4 ) axis[13].push( axis_construct( border_coordin,0, 0, border_color) )
   
  ////////пластина кубов/////////////

  //высчитываем двумерный массив цветов для куба
  let plane_of_colors = plane_square_3x_algorithm(input_nums)

  //задание объектов// они все нужны для того, чтобы можно было к ним потом обращаться и манипулировать
  let plain_x_cube = []
  for (var y = 0; y < (input_string.length+10); y++) {
  // углубление массива на 2 уровень
    plain_x_cube[y] = []
    for (var x = 0; x < input_string.length; x++) 
  // углубление массива 3 уровень
      plain_x_cube[y][x] = []
  }

  //отрисовка панелей
  for (let y = 1; y <= input_string.length; y++)
    for (let x = 1; x <= input_string.length; x++) {
      arr_index = 0
      color_n = plane_of_colors[y][x]

      if (value_default == 3 || value_default == 6 || value_default == 4)
        plain_x_cube[arr_index++][y-1].push( plane_construct( y, x, 0, color_n) )

      if (value_default == 3 || value_default == 6 )
        plain_x_cube[arr_index++][y-1].push( plane_construct( y, 0, x, color_n) )

      if (value_default == 3)
        plain_x_cube[arr_index++][y-1].push( plane_construct( 0, y, x, color_n) )

      if (value_default == 6)
        plain_x_cube[arr_index++][y-1].push( plane_construct( 0, -y, x, color_n) )

      if (value_default == 6 || value_default == 4)
        plain_x_cube[arr_index++][y-1].push( plane_construct( -y, -x, 0, color_n) )

      if (value_default == 6)
        plain_x_cube[arr_index++][y-1].push( plane_construct( -y, 0, -x, color_n) )

      if (value_default == 6)
        plain_x_cube[arr_index++][y-1].push( plane_construct( 0, y, -x, color_n) )

      if (value_default == 4)
        plain_x_cube[arr_index++][y-1].push( plane_construct( -x, y, 0, color_n) )

      if (value_default == 4)
        plain_x_cube[arr_index++][y-1].push( plane_construct( x, -y, 0, color_n) )

    }


////////////////////////////////////////////////////////////////////////////////////////
                      ////блок для углубления куба/////
////////////////////////////////////////////////////////////////////////////////////////

  function cube_3d() {
  //функция для перебора и возврата значений colornum
    let colornum_return = (value) => {
      let plane_z = []
      for (let i=0; i < value.length; i++) plane_z.push(value[i].colornum)

      return plane_z
    }

    for (let i = 0; i < input_string.length; i++) {
      let plane_of_colors_for = plane_square_3x_algorithm( [axis[0][i+1].colornum, ...colornum_return(plain_x_cube[0][i])] )

      for (let y = 1; y <= input_string.length; y++) {
        for (let x = 1; x <= input_string.length; x++) {

          let color_n = plane_of_colors_for[y][x]
          plain_x_cube[value_default+i][y-1].push( plane_construct( y, i+1, x, color_n) )

        }
      }
    }
  }

  if ( value_default == 3 ) cube_3d()


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

    // controls.update() //манипуляция со сценой
    // console.log(camera.position)
    renderer.render( scene, camera )


    }


  ///////// применил отслеживание по клику с помощью библиотеки threex.domevents.js ////////
  var domEvents = new THREEx.DomEvents(camera, renderer.domElement)


  //назначил перебором отслеживание событий на каждую ось
  for (let i = 0; i < axis.length; i++)
    for (let j = 0; j < axis[i].length; j++)
      domEvents.addEventListener( axis[i][j], 'mousedown', (event)=> {color_select_unvisibler(event.target.colornum)})

  //назначил перебором отслеживание событий на каждую плоскость
  for (let i = 0; i < plain_x_cube.length; i++)
      for(let j = 0; j < plain_x_cube[i].length; j++)
        for(let k = 0; k < plain_x_cube[i][j].length; k++)
          domEvents.addEventListener( plain_x_cube[i][j][k], 'mousedown', (event)=> {color_select_unvisibler(event.target.colornum)})

  // //функция исчезания кубов в найденых в domEvents
  var color_select_unvisibler = (color) => {
    //перебор по осям
    for (let i = 0; i < axis.length; i++)
      for (let j = 0; j < axis[i].length; j++) {
        if (color == "#") axis[i][j].visible = false //все объекты сделать невидимыми
        if (color == "@") axis[i][j].visible = !axis[i][j].visible //поменять видимые с невидимыми
        if (color == "A") axis[i][j].visible = true //все объекты сделать видимыми
        if (axis[i][j].colornum == color) axis[i][j].visible = !axis[i][j].visible //сделать видимым/невидимым один цвет
      }
    //перебор по плоскостям
    for (let i = 0; i < plain_x_cube.length; i++)
      for(let j = 0; j < plain_x_cube[i].length; j++)
        for(let k = 0; k < plain_x_cube[i][j].length; k++) {
          if (color == "#") plain_x_cube[i][j][k].visible = false //все объекты сделать невидимыми
          if (color == "@") plain_x_cube[i][j][k].visible = !plain_x_cube[i][j][k].visible //поменять видимые с невидимыми
          if (color == "A") plain_x_cube[i][j][k].visible = true //все объекты сделать видимыми
          if (plain_x_cube[i][j][k].colornum == color) plain_x_cube[i][j][k].visible = !plain_x_cube[i][j][k].visible
        }
  }
  //отслеживание нажатия кнопок боковой панели
  for (var i = 0; i < palitra.length; i++) {
    palitra[i].onmousedown = (event) => color_select_unvisibler(event.target.innerHTML)
  }

} //init() end bracket

//////////////////////////////////////////////////////////////////////////////////
/////функция изменения центровки камеры при изменении размера экрана///////////////
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth-40, window.innerHeight-4)

  // controls.update() //для сохранения пропорций при динамическом изменении ширины экрана
  // console.log(camera.position)
}

/////////////////////////////////////////////////////////
// универсальная функция числа фибоначчи/////////////////
const to_one_fibbonachi_digit = (digit) => {

    let string_of_digits = digit.toString()
    digit = 0

    for (let i=0; i < string_of_digits.length; i++)
      digit += parseInt(string_of_digits[i])

    return (digit > 9) ? to_one_fibbonachi_digit(digit) : digit

  }
//////////функция конструктора объектов/////////////////////////////////////////////////////////////
///передаются координаты и номер цвета
const axis_construct = plane_construct = function(x, y, z, colornum) {

    let cubus = new THREE.Mesh(cubeGeom(), cubeMaterial(colornum)) //функции определены перед init()
    cubus.position.set(x,y,z)
    cubus.colornum = colornum //идентификатор для отбора объектов по значению
    scene.add(cubus)

    return cubus
  }


  ////////пластина мандалы из кубов по первому алгоритму (Юлин вариант)////////////////////////////
  let plane_square_3x_algorithm = (input_nums) => {
    //задаём основной цифро-световой массив мандалы
    let plane_of_colors = []
    //сначала назначаем ось по горизонтали
      plane_of_colors[0] = input_nums
    //и зеркально по вертикали
    for (let i=1; i <= input_nums.length; i++) {
      plane_of_colors[i] = [plane_of_colors[0][i]]
    }

    //высчитываем мандалу на основе заданных осей (массивы считаются от 1, потому что -1)
    for (let y=1; y <= input_nums.length; y++)
      for (var x=1; x <= input_nums.length; x++) {

        let fibbo_number = to_one_fibbonachi_digit( plane_of_colors[y-1][x] +
                                         plane_of_colors[y][x-1] +
                                         plane_of_colors[y-1][x-1])

        plane_of_colors[y].push(fibbo_number)
      }

    return plane_of_colors
  }