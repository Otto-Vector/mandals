
window.onload = init


/////задание глобальных переменных////////////////////////////////////////
var scene, camera, renderer, domEvents, controls

//////////////////////////////////////////////////////////
// универсальная функция числа фибоначчи/////////////////
const to_one_digit = (digit) => {

    let string_of_digits = digit.toString()
    digit = 0

    for (let i=0; i < string_of_digits.length; i++)
      digit += parseInt(string_of_digits[i])

    return (digit > 9) ? to_one_digit(digit) : digit

  }
//////////функция конструктора объектов//////
///передаётся объект, материал для него и координаты
const axis_construct = plane_construct = (geo, material, x, y, z, colornum) => {
    let cubus
    cubus = new THREE.Mesh(geo,material)
    cubus.position.set(x,y,z)
    cubus.colornum = colornum //идентификатор для отбора объектов по значению
    scene.add(cubus)
    return cubus
  }

///////////////////////////////////////////////////////////////////////////////
function init() {

  //////////Задал основные константы///////

  //размеры кубов
  const cubeGeom = new THREE.CubeGeometry(1,1,1)

  //база цветов//
  let colors = [0xFFFFFF, 0xE4388C, 0xE4221B, 0xFF7F00, 0xFFED00, 0x008739, 0x02A7AA, 0x47B3E7, 0x2A4B9B, 0x702283]

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
  input_nums[0] = to_one_digit(input_nums[0])

  ///////////////////////////////////////////////////////////////////////////  
  //добавил сцену
  scene = new THREE.Scene()
  scene.background = new THREE.Color( "white" ) //задал сцене задний фон

  //настроил параметры камеры
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 )
  // camera.position.set( -45, 45, 45 ) //позиция камеры
  camera.position.set( -45, -45, -45 ) //позиция камеры
  camera.lookAt( 0, 0, 0 ) //смотреть в центр координат

  //выбрал рендер
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( window.innerWidth-4, window.innerHeight-4 ) //отнял по 4 пикселя, потому что появляется прокрутка

  //добавление скрипта к документу в тег
  document.body.appendChild( renderer.domElement )
  //при динамическом изменении размера окна
  window.addEventListener('resize', onWindowResize, false)

  ///////////МАНИПУЛЯЦИЯ СЦЕНОЙ
  // также активация внутри функции render() и onwindowresize() строкой controls.update()
  controls = new THREE.OrbitControls (camera, renderer.domElement)
  controls.minDistance = 1
  controls.maxDistance = 80

  ///////////////////////////////////////////////////////////////////////////////
  //добавляем куб

  //нулевой куб в центре оси
  let cubeMaterial_zero = new THREE.MeshBasicMaterial({color: colors[input_nums[0]] })
  let cube_zero = new THREE.Mesh(cubeGeom,cubeMaterial_zero)
  cube_zero.position.set(0,0,0)
  scene.add(cube_zero)

  //сборка осей по 6 направлениям
  let axis = []
  for (let i = 0; i < 6; i++) axis[i] = []

  for (let i = 1; i <= input_string.length; i++) {
    let color_n = input_nums[i]
    let cubeMaterial = new THREE.MeshBasicMaterial({color: colors[input_nums[i]] })

    axis[0].push( axis_construct(cubeGeom, cubeMaterial, 0+i,0,0, color_n) )
    axis[1].push( axis_construct(cubeGeom, cubeMaterial, 0,0+i,0, color_n) )
    axis[2].push( axis_construct(cubeGeom, cubeMaterial, 0,0,0+i, color_n) )

    // axis[3].push( axis_construct(cubeGeom, cubeMaterial, 0-i,0,0, color_n) )
    // axis[4].push( axis_construct(cubeGeom, cubeMaterial, 0,0-i,0, color_n) )
    // axis[5].push( axis_construct(cubeGeom, cubeMaterial, 0,0,0-i, color_n) )

  }


////////пластина мандалы из кубов//////////////////////////////////////////////////
  //задаём основной цифро-световой массив мандалы
  var plane_of_colors = []
  //сначала назначаем ось по горизонтали
    plane_of_colors[0] = input_nums
  //и зеркально по вертикали
  for (let i=1; i <= input_string.length; i++) {
    plane_of_colors[i] = [plane_of_colors[0][i]]
  }

  //высчитываем мандалу на основе заданных осей (массивы от 1)
  for (let y=1; y <= input_string.length; y++)
    for (var x = 1; x <= input_string.length; x++) {

      let fibbo_number = to_one_digit( plane_of_colors[y-1][x] +
                                       plane_of_colors[y][x-1] +
                                       plane_of_colors[y-1][x-1])
      plane_of_colors[y].push(fibbo_number)

    }

  ////////пластина кубов/////////////
  //задание объектов// они все нужны для того, чтобы можно было к ним потом обращаться и манипулировать
  let plain_x_cube = []
  // углубление массива на 2 уровень
  for (var y = 0; y < 6; y++) plain_x_cube[y] = []
  // углубление массива 3 уровень
  for (var y = 0; y < 6; y++) 
    for (var x = 0; x < input_string.length; x++) 
      plain_x_cube[y][x] = []

  //отрисовка панелей
  for (let y = 1; y <= input_string.length; y++) {
    for (let x = 1; x <= input_string.length; x++) {

      let color_n = plane_of_colors[y][x]
      let cubeMaterial = new THREE.MeshBasicMaterial({color: colors[plane_of_colors[y][x]]});

      plain_x_cube[0][y-1].push( plane_construct(cubeGeom, cubeMaterial, y, x, 0, color_n) )
      plain_x_cube[1][y-1].push( plane_construct(cubeGeom, cubeMaterial, y, 0, x, color_n) )

      plain_x_cube[2][y-1].push( plane_construct(cubeGeom, cubeMaterial, 0, y, x, color_n) )

      // plain_x_cube[2][y-1].push( plane_construct(cubeGeom, cubeMaterial, 0, -y, x, color_n) )
      // plain_x_cube[3][y-1].push( plane_construct(cubeGeom, cubeMaterial, -y, -x, 0, color_n) )
      // plain_x_cube[4][y-1].push( plane_construct(cubeGeom, cubeMaterial, -y, 0, -x, color_n) )
      // plain_x_cube[5][y-1].push( plane_construct(cubeGeom, cubeMaterial, 0, y, -x, color_n) )

    }
  }

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
      domEvents.addEventListener( axis[i][j], 'mousedown', (event)=> {color_select_unvisibler(event)})

  for (let i = 0; i < plain_x_cube.length; i++)
      for(let j = 0; j < plain_x_cube[i].length; j++)
        for(let k = 0; k < plain_x_cube[i][j].length; k++)
          domEvents.addEventListener( plain_x_cube[i][j][k], 'mousedown', (event)=> {color_select_unvisibler(event)})

  // //функция исчезания кубов в найденых в domEvents
  var color_select_unvisibler = (event) => {
    let color = event.target.colornum

    for (let i = 0; i < axis.length; i++)
      for (let j = 0; j < axis[i].length; j++)
        if (axis[i][j].colornum == color) axis[i][j].visible = false

    for (let i = 0; i < plain_x_cube.length; i++)
      for(let j = 0; j < plain_x_cube[i].length; j++)
        for(let k = 0; k < plain_x_cube[i][j].length; k++)
          if (plain_x_cube[i][j][k].colornum == color) plain_x_cube[i][j][k].visible = false
  }


} //init() end bracket

/////функция изменения центровки камеры при изменении размера экрана///////////////
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth-4, window.innerHeight-4)

  controls.update() //для сохранения пропорций при динамическом изменении ширины экрана

}
