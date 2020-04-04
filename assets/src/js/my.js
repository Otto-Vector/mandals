
window.onload = init


/////задание глобальных переменных////////////////////////////////////////
var scene, camera, renderer, domEvents, controls

var value_default = 6 //задаёт две разные мандалы (пока на 3 и на 6 пластин)

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
  controls = new THREE.OrbitControls (camera, renderer.domElement)
  controls.minDistance = 1
  controls.maxDistance = 80

  //////////////////////////BEGIN/////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
   //ввод цифр для расчёта мандалы
  let input_string = prompt("Введите цифры", '')
  // let input_string = "0123456789"

  //перевод строки в массив чисел для корректных подсчётов
  let input_nums = []
  input_nums[0] = 0 //цвет для нулевого куба

  for (let i=1; i <= input_string.length; i++) {
    input_nums[i] = parseInt(input_string[i-1])
    input_nums[0] += input_nums[i]; //сумма для цвета числа в центре
  }

  //фибоначи на нулевой куб
  input_nums[0] = to_one_fibbonachi_digit(input_nums[0])

////////////////////////////////////////////////////////////////////////////////
  //добавляем ось//

  //объявляем двумерный массив
  let axis = []
  for (let i = 0; i < value_default; i++) axis[i] = []

  //нулевой куб в центре оси
  axis[0][0] = axis_construct(0,0,0, input_nums[0])

  //сборка осей по value_default направлениям
  for (let i = 1; i <= input_string.length; i++) {
    let color_n = input_nums[i]

    axis[0].push( axis_construct( 0+i,0,0, color_n) )
    axis[1].push( axis_construct( 0,0+i,0, color_n) )
    axis[2].push( axis_construct( 0,0,0+i, color_n) )

    if ( value_default == 6 ) {
      axis[3].push( axis_construct( 0-i,0,0, color_n) )
      axis[4].push( axis_construct( 0,0-i,0, color_n) )
      axis[5].push( axis_construct( 0,0,0-i, color_n) )
    }
  }

  ////////пластина кубов/////////////

  //высчитываем двумерный массив цветов для куба
  let plane_of_colors = plane_square_3x_algorithm(input_nums)

  //задание объектов// они все нужны для того, чтобы можно было к ним потом обращаться и манипулировать
  let plain_x_cube = []
  for (var y = 0; y < (input_string.length+value_default); y++) {
  // углубление массива на 2 уровень
    plain_x_cube[y] = []
    for (var x = 0; x < input_string.length; x++) 
  // углубление массива 3 уровень
      plain_x_cube[y][x] = []
  }

  //отрисовка панелей
  for (let y = 1; y <= input_string.length; y++) {
    for (let x = 1; x <= input_string.length; x++) {

      let color_n = plane_of_colors[y][x]

      plain_x_cube[0][y-1].push( plane_construct( y, x, 0, color_n) )
      plain_x_cube[1][y-1].push( plane_construct( y, 0, x, color_n) )

      if (value_default == 3) plain_x_cube[2][y-1].push( plane_construct( 0, y, x, color_n) )

      if (value_default == 6) {
        plain_x_cube[2][y-1].push( plane_construct( 0, -y, x, color_n) )
        plain_x_cube[3][y-1].push( plane_construct( -y, -x, 0, color_n) )
        plain_x_cube[4][y-1].push( plane_construct( -y, 0, -x, color_n) )
        plain_x_cube[5][y-1].push( plane_construct( 0, y, -x, color_n) )
      }

    }
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

    controls.update() //манипуляция со сценой

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
      for (let j = 0; j < axis[i].length; j++)
        if (axis[i][j].colornum == color) axis[i][j].visible = !axis[i][j].visible
    //перебор по плоскостям
    for (let i = 0; i < plain_x_cube.length; i++)
      for(let j = 0; j < plain_x_cube[i].length; j++)
        for(let k = 0; k < plain_x_cube[i][j].length; k++)
          if (plain_x_cube[i][j][k].colornum == color) plain_x_cube[i][j][k].visible = !plain_x_cube[i][j][k].visible
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

  controls.update() //для сохранения пропорций при динамическом изменении ширины экрана

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


  ////////пластина мандалы из кубов по первому алгоритму////////////////////////////
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
      for (var x = 1; x <= input_nums.length; x++) {

        let fibbo_number = to_one_fibbonachi_digit( plane_of_colors[y-1][x] +
                                         plane_of_colors[y][x-1] +
                                         plane_of_colors[y-1][x-1])

        plane_of_colors[y].push(fibbo_number)
      }

    return plane_of_colors
  }