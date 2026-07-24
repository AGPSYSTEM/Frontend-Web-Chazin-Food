																									
																									
Proceso	Subproceso	Epica	Yo como	ROL DE USUARIO	Deseo - Necesito - Quiero	OBJETIVO	Para poder	" BENEFICIO
(Para el usuario)"	Código Historia Usuario	Redacción Historia de Usuario	Código Criterio de Aceptación	Criterios de Aceptación													
01. Configuración	Gestión de Roles	Yo como administrador necesito gestionar roles y asignar sus permisos correspondientes.	Yo como	administrador	necesito	Crear un rol definiendo los permisos de acceso a los diferentes módulos del sistema,	para poder	dar acceso a los usuarios a los diferentes módulos de la aplicación.	HU_01	Yo como administrador necesito Crear un rol definiendo los permisos de acceso a los diferentes módulos del sistema, para poder dar acceso a los usuarios a los diferentes módulos de la aplicación.	HU_01_01	Se deben ingresar los campos: nombre_rol (VARCHAR 80), descripción_rol (VARCHAR 150), permisos (JSON/ARRAY con módulos y acciones permitidas), estado_rol (BOOLEAN)													
											HU_01_02	El sistema no debe permitir crear un rol con un nombre ya existente													
											HU_01_03	El sistema debe mostrar una alerta solicitando confirmación al usuario para la creación del rol.													
			Yo como	administrador	necesito	editar un rol,	para poder	actualizar el acceso que tiene a los distintos módulos.	HU_02	Yo como administrador necesito editar un rol, para poder actualizar el acceso que tiene a los distintos módulos.	HU_02_01	"El sistema debe permitir modificar los campos:
nombre_rol (VARCHAR 80), descripcion_rol (VARCHAR 150), permisos (JSON/ARRAY), estado_rol (BOOLEAN)."													
											HU_02_02	El sistema no debe permitir modificar el nombre del rol por uno que ya se encuentre registrado.													
											HU_02_03	El sistema debe mostrar una alerta solicitando confirmación al usuario para editar el rol.													
			Yo como	administrador	necesito	listar roles,	para poder	conocer los roles registrados en el sistema.	HU_03	Yo como administrador necesito listar roles, para poder conocer los roles registrados en el sistema.	HU_03_01	Solo los usuarios con permisos de administrador deben poder acceder a esta funcionalidad.													
											HU_03_02	La lista de roles debe mostrarse en una tabla con: nombre del rol, descripción y número de usuarios asignados.													
											HU_03_03	Debe haber una opción para filtrar la lista de roles por nombre.													
			Yo como	administrador	necesito	cambiar el estado de un rol,	para poder	activar o desactivar un rol en caso de no necesitarlo.	HU_04	Yo como administrador necesito cambiar el estado de un rol, para poder activar o desactivar un rol en caso de no necesitarlo.	HU_04_01	El sistema toma el Id del rol seleccionado (INT).													
											HU_04_02	Se modifica el campo: estado (BOOLEAN) (Activo/Inactivo).													
											HU_04_03	El sistema no debe permitir cambiar el estado de un rol sin confirmación previa del usuario.													
			Yo como	administrador	necesito	consultar el detalle de un rol,	para poder	visualizar su información y permisos asignados antes de tomar decisiones de administración.	HU_05	Yo como administrador necesito consultar el detalle de un rol, para poder visualizar su información y permisos asignados antes de tomar decisiones de administración.	HU_05_01	El sistema debe permitir seleccionar un rol y visualizar: nombre_rol, descripcion_rol, estado_rol y permisos asignados.													
											HU_05_02	Solo los usuarios con permisos de administrador pueden consultar el detalle del rol.													
											HU_05_03	La vista de detalle debe mostrar el número de usuarios asociados al rol.													
02. Usuarios	Gestión de Usuarios	Yo como administrador necesito administrar usuarios internos, su rol y estado para controlar el acceso al sistema.	Yo como	administrador	necesito	crear un usuario,	para poder	dar acceso al sistema a los colaboradores del negocio.	HU_06	Yo como administrador necesito crear un usuario, para poder dar acceso al sistema a los colaboradores del negocio.	HU_06_01	Solo los usuarios con permisos de administrador deben poder acceder a la funcionalidad de creación de usuarios.													
											HU_06_02	"El formulario debe solicitar los campos:
nombre_usuario (VARCHAR 100),
correo_usuario (VARCHAR 120) UNIQUE,
contraseña (VARCHAR 255),
id_rol (INT). "													
											HU_06_03	El sistema debe validar que todos los campos obligatorios estén completos antes de crear el usuario.													
			Yo como	administrador	necesito	listar usuarios,	para poder	administrar sus detalles y realizar acciones sobre ellos.	HU_07	Yo como administrador necesito listar usuarios, para poder administrar sus detalles y realizar acciones sobre ellos.	HU_07_01	Solo los usuarios con permisos de administrador deben poder acceder a esta funcionalidad.													
											HU_07_02	"La lista debe mostrar en una tabla los campos:
id_usuario (INT),
nombre_usuario (VARCHAR 100),
correo_usuario (VARCHAR 120),
id_rol (INT),
estado_usuario (BOOLEAN),
fecha_creacion (DATETIME)."													
											HU_07_03	Debe haber opción para filtrar por nombre, correo electrónico o estado.													
			Yo como	administrador	necesito	editar un usuario,	para poder	actualizar la información de un colaborador.	HU_08	Yo como administrador necesito editar un usuario, para poder actualizar la información de un colaborador.	HU_08_01	El sistema toma el id del usuario (INT).													
											HU_08_02	"Se modifican los campos:
nombre_usuario (VARCHAR 100),
id_rol (INT),
estado_usuario (BOOLEAN).
No se permite modificar el correo_usuario."													
											HU_08_03	El sistema debe mostrar una alerta de confirmación antes de aplicar los cambios.													
			Yo como	administrador	necesito	cambiar el estado de un usuario,	para poder	activar o inactivar el acceso de un colaborador.	HU_09	Yo como administrador necesito cambiar el estado de un usuario, para poder activar o inactivar el acceso de un colaborador.	HU_09_01	Se muestran los campos: IdUsuario (INT), nombre (VARCHAR 50), correo (VARCHAR 100), rol (VARCHAR 50), estado (BOOLEAN).													
											HU_09_02	El administrador debe poder cambiar el estado entre Activo e Inactivo.													
											HU_09_03	El sistema debe mostrar un mensaje de éxito tras el cambio de estado.													
			Yo como	administrador	necesito	generar reporte de usuarios,	para poder	obtener un resumen estadístico de los usuarios del sistema.	HU_10	Yo como administrador necesito generar reporte de usuarios, para poder obtener un resumen estadístico de los usuarios del sistema.	HU_10_01	El sistema debe permitir generar el reporte filtrado por rol, estado o fecha de registro.													
											HU_10_02	El reporte debe incluir: nombre, correo, rol, estado y fecha de creación.													
											HU_10_03	El reporte debe ser exportable en formato PDF o Excel.													
	Gestión de Acceso	Yo como usuario del sistema necesito gestionar la autenticación y el control de acceso con seguridad y trazabilidad del ingreso al sistema.	Yo como	usuario	necesito	iniciar sesión,	para poder	ingresar al sistema de forma segura.	HU_11	Yo como usuario necesito iniciar sesión, para poder ingresar al sistema de forma segura.	HU_11_01	El sistema debe validar que el correo_usuario exista en la base de datos antes de permitir el inicio de sesión.													
											HU_11_02	Se ingresan los campos: correo_usuario (VARCHAR 120) y contraseña (VARCHAR 255).													
											HU_11_03	El sistema debe validar que el correo y la contraseña ingresados sean correctos antes de permitir el acceso.													
			Yo como	usuario	necesito	cerrar sesión,	para poder	salir del sistema y proteger la cuenta.	HU_12	Yo como usuario necesito cerrar sesión, para poder salir del sistema y proteger la cuenta.	HU_12_01	El sistema toma el id (INT) del usuario logueado.													
											HU_12_02	El sistema destruye la sesión activa.													
											HU_12_03	El sistema redirige al usuario al formulario de inicio de sesión (Sign In).													
			Yo como	usuario	necesito	recuperar contraseña,	para poder	restablecer el acceso al sistema en caso de olvido.	HU_13	Yo como usuario necesito recuperar contraseña, para poder restablecer el acceso al sistema en caso de olvido.	HU_13_01	Se ingresa el campo correo electrónico (VARCHAR 100).													
											HU_13_02	El sistema genera una URL con código de reactivación y la envía al correo registrado.													
											HU_13_03	Después de establecer la nueva contraseña, el sistema confirma que el cambio fue exitoso.													
			Yo como	usuario	necesito	restablecer contraseña,	para poder	ingresar nuevamente al aplicativo.	HU_14	Yo como usuario necesito restablecer contraseña, para poder ingresar nuevamente al aplicativo.	HU_14_01	"El enlace de recuperación redirige a un formulario con los campos:
nueva_contraseña (VARCHAR 255) y confirmar_contraseña (VARCHAR 255)."													
											HU_14_02	El sistema no debe permitir restablecer la contraseña si los campos no coinciden.													
											HU_14_03	La contraseña debe cumplir políticas de seguridad: mínimo 8 caracteres, al menos una mayúscula y un carácter especial.													
03. Compras	Categoría de Insumos	Yo como administrador necesito administrar las categorías de insumos.	Yo como	administrador	necesito	crear una categoría de insumos,	para poder	organizar los insumos por tipo.	HU_15	Yo como administrador necesito crear una categoría de insumos, para poder organizar los insumos por tipo.	HU_15_01	"El sistema debe permitir registrar una categoría de insumos ingresando los campos:
nombre_categoria (VARCHAR 80), descripcion (VARCHAR 200) y estado (BOOLEAN)."													
											HU_15_02	El sistema no debe permitir crear una categoría con nombre duplicado.													
											HU_15_03	El sistema debe mostrar un mensaje de confirmación cuando la categoría sea registrada correctamente en la base de datos.													
			Yo como	administrador	necesito	listar categorías de insumos,	para poder	visualizar todas las categorías registradas.	HU_16	Yo como administrador necesito listar categorías de insumos, para poder visualizar todas las categorías registradas.	HU_16_01	La lista de categorías debe mostrarse en una tabla con los campos: nombre_categoria, descripcion y estado.													
											HU_16_02	Debe existir opción de filtrar por nombre o estado.													
											HU_16_03	Solo usuarios con permisos de administrador pueden acceder a esta funcionalidad.													
			Yo como	administrador	necesito	editar una categoría de insumos,	para poder	corregir o actualizar la información de una categoría.	HU_17	Yo como administrador necesito editar una categoría de insumos, para poder corregir o actualizar la información de una categoría.	HU_17_01	El sistema toma el id de la categoría (INT).													
											HU_17_02	Se modifican los campos: nombre_categoria (VARCHAR 80) y descripción (VARCHAR 200).													
											HU_17_03	El sistema no debe permitir cambiar el nombre por uno ya existente.													
			Yo como	administrador	necesito	eliminar una categoría de insumos,	para poder	depurar categorías que ya no estén en uso.	HU_18	Yo como administrador necesito eliminar una categoría de insumos, para poder depurar categorías que ya no estén en uso.	HU_18_01	El sistema debe solicitar confirmación antes de eliminar la categoría.													
											HU_18_02	No se debe permitir eliminar una categoría que tenga insumos asociados activos.													
											HU_18_03	Tras la eliminación, la categoría no debe aparecer en el listado.													
	Gestión de Insumos	Yo como administrador necesito gestionar los insumos con control de inventario y alertas de bajo stock.	Yo como	administrador	necesito	registrar un insumo,	para poder	llevar control del inventario de materias primas.	HU_19	Yo como administrador necesito registrar un insumo, para poder llevar control del inventario de materias primas.	HU_19_01	Se ingresan los campos: nombre_insumo (VARCHAR 100), id_categoria (INT), unidad_medida (VARCHAR 20), stock_minimo (DECIMAL), stock_actual (DECIMAL), estado (BOOLEAN).													
											HU_19_02	El sistema no debe permitir registrar un insumo con nombre duplicado dentro de la misma categoría.													
											HU_19_03	El sistema debe mostrar confirmación tras el registro exitoso del insumo.													
			Yo como	administrador	necesito	listar insumos,	para poder	consultar el inventario de insumos disponibles.	HU_20	Yo como administrador necesito listar insumos, para poder consultar el inventario de insumos disponibles.	HU_20_01	La lista debe mostrar: nombre, categoría, unidad de medida, stock actual, stock mínimo y estado.													
											HU_20_02	Debe existir opción para filtrar por categoría, nombre o estado.													
											HU_20_03	El sistema debe resaltar visualmente los insumos con stock por debajo del mínimo.													
			Yo como	administrador	necesito	editar un insumo,	para poder	actualizar la información o stock de un insumo.	HU_21	Yo como administrador necesito editar un insumo, para poder actualizar la información o stock de un insumo.	HU_21_01	El sistema toma el id del insumo (INT).													
											HU_21_02	Se modifican los campos: nombre, categoría, unidad de medida, stock mínimo y stock actual.													
											HU_21_03	El sistema debe mostrar un mensaje de confirmación tras la edición.													
			Yo como	administrador	necesito	cambiar el estado de un insumo,	para poder	marcarlo como disponible o agotado.	HU_22	Yo como administrador necesito cambiar el estado de un insumo, para poder marcarlo como disponible o agotado.	HU_22_01	El sistema toma el id del insumo (INT).													
											HU_22_02	Se modifica el campo estado (BOOLEAN): Disponible / Agotado.													
											HU_22_03	El sistema debe alertar al administrador cuando un insumo sea marcado como agotado.													
			Yo como	administrador	necesito	consultar el detalle de un insumo,	para poder	revisar su información, categoría y existencias antes de realizar ajustes.	HU_23	Yo como administrador necesito consultar el detalle de un insumo, para poder revisar su información, categoría y existencias antes de realizar ajustes.	HU_23_01	El sistema debe permitir seleccionar un insumo y visualizar: nombre_insumo, categoria, unidad_medida, stock_actual, stock_minimo y estado.													
											HU_23_02	La vista debe mostrar de forma clara la categoría y la unidad de medida asociadas al insumo.													
											HU_23_03	Solo los usuarios autorizados pueden consultar el detalle del insumo.													
	Gestión de Proveedores	Yo como administrador necesito gestionar la información y trazabilidad de los proveedores del negocio.	Yo como	administrador	necesito	registrar un proveedor,	para poder	contar con una base de datos de proveedores disponibles.	HU_24	Yo como administrador necesito registrar un proveedor, para poder contar con una base de datos de proveedores disponibles.	HU_24_01	Se ingresan los campos: nombre (VARCHAR 150), tipo (Natural/Jurídico), NIT o CC (VARCHAR 20), teléfono (VARCHAR 15), correo (VARCHAR 100), dirección (VARCHAR 200).													
											HU_24_02	El sistema no debe permitir registrar un proveedor con NIT o CC duplicado.													
											HU_24_03	El sistema debe mostrar confirmación tras el registro exitoso del proveedor.													
			Yo como	administrador	necesito	listar proveedores,	para poder	consultar los proveedores registrados en el sistema.	HU_25	Yo como administrador necesito listar proveedores, para poder consultar los proveedores registrados en el sistema.	HU_25_01	La lista debe incluir: nombre, tipo, NIT/CC, teléfono y correo.													
											HU_25_02	Debe haber opción para filtrar por nombre o tipo de proveedor.													
											HU_25_03	Solo usuarios con permisos de administrador pueden acceder a esta funcionalidad.													
			Yo como	administrador	necesito	editar un proveedor,	para poder	actualizar la información de un proveedor existente.	HU_26	Yo como administrador necesito editar un proveedor, para poder actualizar la información de un proveedor existente.	HU_26_01	El sistema toma el id del proveedor (INT).													
											HU_26_02	Se modifican los campos: nombre, teléfono, correo y dirección.													
											HU_26_03	El sistema debe mostrar un mensaje de confirmación tras la edición.													
			Yo como	administrador	necesito	eliminar un proveedor,	para poder	depurar proveedores inactivos del sistema.	HU_27	Yo como administrador necesito eliminar un proveedor, para poder depurar proveedores inactivos del sistema.	HU_27_01	El sistema debe solicitar confirmación antes de eliminar el proveedor.													
											HU_27_02	No se debe permitir eliminar un proveedor con compras activas asociadas.													
											HU_27_03	Tras la eliminación, el proveedor no debe aparecer en el listado.													
	Gestión de Compras	Yo como administrador necesito gestionar compras con control, devoluciones, pérdidas y trazabilidad de movimientos.	Yo como	administrador	necesito	registrar una compra,	para poder	llevar el control de las adquisiciones de insumos.	HU_28	Yo como administrador necesito registrar una compra, para poder llevar el control de las adquisiciones de insumos.	HU_28_01	Se ingresan los campos: id_proveedor (INT), fecha_compra (DATE), lista de insumos con cantidad (DECIMAL) y precio_unitario (DECIMAL).													
											HU_28_02	El sistema debe calcular automáticamente el total de la compra.													
											HU_28_03	El sistema debe actualizar el stock del insumo tras registrar la compra.													
			Yo como	administrador	necesito	consultar compras realizadas,	para poder	revisar el historial de adquisiciones.	HU_29	Yo como administrador necesito consultar compras realizadas, para poder revisar el historial de adquisiciones.	HU_29_01	La lista de compras debe mostrar: fecha, proveedor, total y estado.													
											HU_29_02	Debe haber opción para filtrar por rango de fecha, proveedor o estado.													
											HU_29_03	El sistema debe permitir exportar el listado en formato PDF o Excel.													
			Yo como	administrador	necesito	anular una compra,	para poder	revertir una compra errónea o no recibida.	HU_30	Yo como administrador necesito anular una compra, para poder revertir una compra errónea o no recibida.	HU_30_01	El sistema toma el id de la compra (INT).													
											HU_30_02	El administrador debe ingresar una observación (VARCHAR 200) para justificar la anulación.													
											HU_30_03	El sistema debe revertir automáticamente el stock de los insumos afectados al anular la compra.													
			Yo como	administrador	necesito	consultar el detalle de una compra,	para poder	revisar los insumos, cantidades y valores registrados en la transacción.	HU_31	Yo como administrador necesito consultar el detalle de una compra, para poder revisar los insumos, cantidades y valores registrados en la transacción.	HU_31_01	El sistema debe mostrar el encabezado de la compra con proveedor, fecha, estado y total.													
											HU_31_02	El detalle debe listar los insumos asociados con cantidad, costo_unitario y subtotal.													
											HU_31_03	Solo los usuarios con permisos de administrador pueden consultar el detalle de la compra.													
			Yo como	administrador	necesito	anular parcialmente una compra,	para poder	revertir uno o varios insumos registrados por error o no recibidos.	HU_32	Yo como administrador necesito anular parcialmente una compra, para poder revertir uno o varios insumos registrados por error o no recibidos.	HU_32_01	El administrador debe poder seleccionar los insumos y cantidades a reversar dentro de una compra existente.													
											HU_32_02	El sistema debe solicitar una observación para justificar la anulación parcial.													
											HU_32_03	Al confirmar, el sistema debe actualizar el total de la compra y ajustar el stock de los insumos afectados.													
04. Producción	Ficha Técnica de Producto	Yo como administrador necesito gestionar las fichas técnicas de productos.	Yo como	administrador	necesito	registrar una ficha técnica de producto,	para poder	estandarizar la receta y costos de cada producto.	HU_33	Yo como administrador necesito registrar una ficha técnica de producto, para poder estandarizar la receta y costos de cada producto.	HU_33_01	Se ingresan los campos: id_producto (INT), ingredientes (lista de insumos con cantidad), presentación (VARCHAR 200), costo_unitario (DECIMAL).													
											HU_33_02	El sistema no debe permitir registrar una ficha técnica para un producto que ya tenga ficha activa.													
											HU_33_03	El sistema debe calcular automáticamente el costo total de la ficha basado en los insumos y cantidades.													
			Yo como	administrador	necesito	consultar fichas técnicas de productos,	para poder	revisar la información de recetas y costos.	HU_34	Yo como administrador necesito consultar fichas técnicas de productos, para poder revisar la información de recetas y costos.	HU_34_01	La lista debe mostrar: producto, ingredientes principales, presentación y costo unitario.													
											HU_34_02	Debe haber opción para buscar por nombre de producto.													
											HU_34_03	El sistema debe mostrar solo las fichas técnicas activas por defecto.													
			Yo como	administrador	necesito	editar una ficha técnica,	para poder	actualizar la receta o costos de un producto.	HU_35	Yo como administrador necesito editar una ficha técnica, para poder actualizar la receta o costos de un producto.	HU_35_01	El sistema toma el id de la ficha técnica (INT).													
											HU_35_02	Se modifican los campos: ingredientes, cantidades, presentación y costo.													
											HU_35_03	El sistema debe recalcular el costo total automáticamente tras la edición.													
			Yo como	administrador	necesito	eliminar una ficha técnica,	para poder	retirar recetas obsoletas del sistema.	HU_36	Yo como administrador necesito eliminar una ficha técnica, para poder retirar recetas obsoletas del sistema.	HU_36_01	El sistema debe solicitar confirmación antes de eliminar la ficha técnica.													
											HU_36_02	No se debe permitir eliminar una ficha técnica de un producto con órdenes de producción activas.													
											HU_36_03	Tras la eliminación, la ficha no debe aparecer en el listado.													
			Yo como	cocinero	necesito	consultar la ficha técnica de un producto,	para poder	conocer la receta y los ingredientes requeridos.	HU_37	Yo como cocinero necesito consultar la ficha técnica de un producto, para poder conocer la receta y los ingredientes requeridos.	HU_37_01	El cocinero puede buscar la ficha técnica por nombre de producto.													
											HU_37_02	Se muestran: ingredientes, cantidades, presentación y procedimiento de preparación.													
											HU_37_03	El cocinero solo tiene permisos de lectura; no puede editar la ficha técnica.													
	Categoría de Productos	Yo como administrador necesito administrar las categorías de productos.	Yo como	administrador	necesito	crear una categoría de productos,	para poder	organizar el menú por tipo de productos.	HU_45	Yo como administrador necesito crear una categoría de productos, para poder organizar el menú por tipo de productos.	HU_45_01	El administrador debe ingresar los campos: nombre_categoria VARCHAR(80), descripcion VARCHAR(200) y estado BOOLEAN.													
											HU_45_02	El sistema no debe permitir crear categorías con nombre duplicado.													
											HU_45_03	El sistema debe mostrar confirmación tras la creación exitosa.													
			Yo como	administrador	necesito	listar categorías de productos,	para poder	revisar la organización del catálogo.	HU_46	Yo como administrador necesito listar categorías de productos, para poder revisar la organización del catálogo.	HU_46_01	La lista muestra: nombre, descripción, número de productos asociados y estado.													
											HU_46_02	Debe haber opción para filtrar por nombre o estado.													
											HU_46_03	Solo el administrador puede acceder a esta funcionalidad con permisos de edición.													
			Yo como	administrador	necesito	editar una categoría de productos,	para poder	actualizar la información de una categoría.	HU_47	Yo como administrador necesito editar una categoría de productos, para poder actualizar la información de una categoría.	HU_47_01	El sistema debe permitir seleccionar la categoría mediante id_categoria INT.													
											HU_47_02	Se modifican los campos: nombre (VARCHAR 80) y descripción (VARCHAR 200).													
											HU_47_03	El sistema no debe permitir asignar un nombre ya existente.													
			Yo como	administrador	necesito	eliminar una categoría de productos,	para poder	depurar categorías no utilizadas.	HU_48	Yo como administrador necesito eliminar una categoría de productos, para poder depurar categorías no utilizadas.	HU_48_01	El sistema debe solicitar confirmación antes de eliminar.													
											HU_48_02	No se permite eliminar una categoría con productos activos asociados.													
											HU_48_03	Tras la eliminación, la categoría no debe aparecer en el catálogo.													
			Yo como	cocinero	necesito	consultar categorías de productos,	para poder	conocer la organización del menú.	HU_49	Yo como cocinero necesito consultar categorías de productos, para poder conocer la organización del menú.	HU_49_01	El cocinero puede ver la lista de categorías con sus productos asociados.													
											HU_49_02	La vista es de solo lectura; el cocinero no puede crear ni editar categorías.													
											HU_49_03	Debe haber opción para buscar por nombre de categoría.													
			Yo como	cliente	necesito	explorar el menú por categorías,	para poder	navegar fácilmente por los tipos de productos disponibles.	HU_50	Yo como cliente necesito explorar el menú por categorías, para poder navegar fácilmente por los tipos de productos disponibles.	HU_50_01	El cliente puede ver las categorías de productos disponibles (hamburguesas, bebidas, etc.).													
											HU_50_02	Al seleccionar una categoría, se muestran los productos disponibles con imagen y precio.													
											HU_50_03	Solo se muestran las categorías con al menos un producto activo.													
	Gestión de Productos	Yo como administrador necesito gestionar los productos del negocio y su disponibilidad.	Yo como	administrador	necesito	registrar un producto,	para poder	añadir nuevos ítems al catálogo del negocio.	HU_51	Yo como administrador necesito registrar un producto, para poder añadir nuevos ítems al catálogo del negocio.	HU_51_01	El administrador debe ingresar los campos: nombre VARCHAR(100), id_categoria INT, descripcion VARCHAR(300), precio DECIMAL, imagen URL y estado BOOLEAN.													
											HU_51_02	El sistema no debe permitir registrar un producto con nombre duplicado en la misma categoría.													
											HU_51_03	El sistema debe confirmar el registro y mostrar el producto en el catálogo.													
			Yo como	administrador	necesito	listar productos,	para poder	consultar los productos registrados y su disponibilidad.	HU_52	Yo como administrador necesito listar productos, para poder consultar los productos registrados y su disponibilidad.	HU_52_01	La lista debe mostrar: nombre, categoría, precio, estado y disponibilidad del producto.													
											HU_52_02	Debe existir opción para filtrar por nombre, categoría o estado.													
											HU_52_03	Solo los usuarios con permisos de administrador pueden acceder a esta funcionalidad.													
			Yo como	administrador	necesito	editar un producto,	para poder	actualizar descripción, precio o imagen de un ítem del menú.	HU_53	Yo como administrador necesito editar un producto, para poder actualizar descripción, precio o imagen de un ítem del menú.	HU_53_01	El sistema toma el id del producto (INT).													
											HU_53_02	Se modifican los campos: nombre, descripción, precio, imagen y estado.													
											HU_53_03	El sistema debe mostrar los cambios reflejados en el catálogo de forma inmediata.													
			Yo como	administrador	necesito	cambiar el estado de un producto,	para poder	activar o desactivar productos sin perder su trazabilidad.	HU_54	Yo como administrador necesito cambiar el estado de un producto, para poder activar o desactivar productos sin perder su trazabilidad.	HU_54_01	El sistema debe permitir seleccionar el id del producto (INT) y modificar el campo estado_producto (BOOLEAN).													
											HU_54_02	Un producto inactivo no debe aparecer disponible para nuevas publicaciones o pedidos.													
											HU_54_03	El sistema debe solicitar confirmación antes de aplicar el cambio de estado.													
			Yo como	cocinero	necesito	consultar la disponibilidad de productos,	para poder	conocer qué productos pueden prepararse o publicarse en el menú.	HU_55	Yo como cocinero necesito consultar la disponibilidad de productos, para poder conocer qué productos pueden prepararse o publicarse en el menú.	HU_55_01	El cocinero puede ver la lista de productos con su estado y disponibilidad actual.													
											HU_55_02	El sistema debe resaltar los productos no disponibles para preparación o venta.													
											HU_55_03	La vista es de solo lectura; el cocinero no puede editar la información del producto.													
			Yo como	cocinero	necesito	actualizar la disponibilidad de un producto,	para poder	informar al administrador cuando un producto no pueda prepararse por falta de insumos.	HU_56	Yo como cocinero necesito actualizar la disponibilidad de un producto, para poder informar al administrador cuando un producto no pueda prepararse por falta de insumos.	HU_56_01	El cocinero puede solicitar el cambio de disponibilidad de un producto a 'No disponible'.													
											HU_56_02	El sistema debe notificar al administrador cuando se registre la novedad de disponibilidad.													
											HU_56_03	La novedad debe almacenar el producto afectado y la observación registrada por el cocinero.													
05. Ventas	Gestión de Clientes	Yo como administrador necesito gestionar la información de clientes.	Yo como	administrador	necesito	registrar un cliente,	para poder	contar con una base de datos de clientes.	HU_57	Yo como administrador necesito registrar un cliente, para poder contar con una base de datos de clientes.	HU_57_01	El administrador debe ingresar los campos: nombre VARCHAR(100), correo VARCHAR(100), telefono VARCHAR(15), direccion VARCHAR(200) y estado BOOLEAN.													
											HU_57_02	El sistema no debe permitir registrar un cliente con correo duplicado.													
											HU_57_03	El sistema debe confirmar el registro del cliente.													
			Yo como	administrador	necesito	consultar la lista de clientes,	para poder	revisar los clientes registrados en el sistema.	HU_58	Yo como administrador necesito consultar la lista de clientes, para poder revisar los clientes registrados en el sistema.	HU_58_01	La lista debe incluir: nombre, correo, teléfono y estado.													
											HU_58_02	Debe haber opción para filtrar por nombre, correo o estado.													
											HU_58_03	El sistema debe mostrar el número de pedidos realizados por cada cliente.													
			Yo como	administrador	necesito	editar información de un cliente,	para poder	actualizar los datos de contacto.	HU_59	Yo como administrador necesito editar información de un cliente, para poder actualizar los datos de contacto.	HU_59_01	El sistema toma el id del cliente (INT).													
											HU_59_02	Se modifican los campos: nombre, teléfono y dirección. No se permite editar el correo.													
											HU_59_03	El sistema debe mostrar confirmación tras la edición.													
			Yo como	administrador	necesito	cambiar el estado de un cliente,	para poder	activar o inactivar un cliente.	HU_60	Yo como administrador necesito cambiar el estado de un cliente, para poder activar o inactivar un cliente.	HU_60_01	Se modifica el campo estado (BOOLEAN): Activo / Inactivo.													
											HU_60_02	Un cliente inactivo no debe poder realizar nuevos pedidos.													
											HU_60_03	El sistema debe mostrar confirmación tras el cambio de estado.													
			Yo como	administrador	necesito	generar reportes de clientes,	para poder	obtener estadísticas sobre la base de clientes.	HU_61	Yo como administrador necesito generar reportes de clientes, para poder obtener estadísticas sobre la base de clientes.	HU_61_01	El reporte debe incluir: número de clientes, clientes activos vs inactivos, top clientes por pedidos.													
											HU_61_02	Debe poderse filtrar por rango de fechas.													
											HU_61_03	El reporte debe ser exportable en formato PDF o Excel.													
	Gestión de Catálogo (Menú)	Yo como administrador necesito gestionar la visualización de los productos disponibles en el catálogo.	Yo como	administrador	necesito	publicar un producto en el catálogo,	para poder	hacer visible el producto para los clientes.	HU_62	Yo como administrador necesito publicar un producto en el catálogo, para poder hacer visible el producto para los clientes.	HU_62_01	El administrador debe ingresar los campos: id_producto INT, imagen URL, precio_comercial DECIMAL y descripcion_comercial VARCHAR(300).													
											HU_62_02	El sistema valida que el producto tenga ficha técnica antes de publicarlo.													
											HU_62_03	El producto publicado debe aparecer de inmediato en el catálogo visible para clientes.													
			Yo como	administrador	necesito	editar un producto del catálogo,	para poder	actualizar imagen, descripción o precio comercial.	HU_63	Yo como administrador necesito editar un producto del catálogo, para poder actualizar imagen, descripción o precio comercial.	HU_63_01	El sistema toma el id del producto en catálogo (INT).													
											HU_63_02	Se modifican los campos: imagen, descripción comercial y precio.													
											HU_63_03	Los cambios deben reflejarse en el catálogo de forma inmediata.													
			Yo como	administrador	necesito	retirar un producto del catálogo,	para poder	ocultarlo temporalmente del menú.	HU_64	Yo como administrador necesito retirar un producto del catálogo, para poder ocultarlo temporalmente del menú.	HU_64_01	El sistema debe solicitar confirmación antes de retirar el producto.													
											HU_64_02	El producto retirado no debe ser visible para clientes, pero sí para el administrador.													
											HU_64_03	El sistema debe registrar la fecha y hora del retiro.													
			Yo como	cocinero	necesito	consultar el catálogo de productos disponibles,	para poder	conocer los productos activos del menú.	HU_65	Yo como cocinero necesito consultar el catálogo de productos disponibles, para poder conocer los productos activos del menú.	HU_65_01	El cocinero puede ver la lista de productos activos del catálogo.													
											HU_65_02	Se muestran: nombre, imagen, categoría y descripción.													
											HU_65_03	La vista es de solo lectura.													
			Yo como	cliente	necesito	explorar el catálogo de productos,	para poder	conocer los productos disponibles y sus precios.	HU_66	Yo como cliente necesito explorar el catálogo de productos, para poder conocer los productos disponibles y sus precios.	HU_66_01	El cliente puede ver el catálogo organizado por categorías.													
											HU_66_02	Cada producto muestra: nombre, imagen, descripción e ingredientes principales y precio.													
											HU_66_03	El cliente puede filtrar el catálogo por categoría o buscar por nombre.													
	Gestión de Pedidos	Yo como administrador necesito gestionar los pedidos del negocio.	Yo como	administrador	necesito	consultar todos los pedidos,	para poder	supervisar el estado de los pedidos en tiempo real.	HU_67	Yo como administrador necesito consultar todos los pedidos, para poder supervisar el estado de los pedidos en tiempo real.	HU_67_01	La lista debe mostrar: código de pedido, cliente, productos, total, estado y fecha.													
											HU_67_02	Debe haber opción para filtrar por estado, fecha o cliente.													
											HU_67_03	El sistema debe actualizar el listado en tiempo real.													
			Yo como	administrador	necesito	editar un pedido,	para poder	corregir errores antes de que sea procesado.	HU_68	Yo como administrador necesito editar un pedido, para poder corregir errores antes de que sea procesado.	HU_68_01	"El administrador solo puede editar pedidos dentro de los primeros 5 minutos después de haber sido recibidos.
"													
											HU_68_02	Se pueden modificar: productos, cantidades y dirección de entrega.													
											HU_68_03	El sistema debe recalcular el total automáticamente.													
			Yo como	administrador	necesito	cancelar un pedido,	para poder	anular pedidos que no pueden ser atendidos.	HU_69	Yo como administrador necesito cancelar un pedido, para poder anular pedidos que no pueden ser atendidos.	HU_69_01	El administrador debe ingresar un motivo de cancelación (VARCHAR 200).													
											HU_69_02	El sistema debe notificar al cliente sobre la cancelación.													
											HU_69_03	No se puede cancelar un pedido con estado 'En camino' o 'Entregado'.													
			Yo como	administrador	necesito	dar seguimiento a los pedidos,	para poder	monitorear el avance desde la cocina hasta la entrega.	HU_70	Yo como administrador necesito dar seguimiento a los pedidos, para poder monitorear el avance desde la cocina hasta la entrega.	HU_70_01	El sistema debe mostrar el estado actual de cada pedido: Recibido, En preparación, Listo, En camino, Entregado.													
											HU_70_02	El administrador puede actualizar manualmente el estado de un pedido.													
											HU_70_03	El sistema debe registrar la hora de cada cambio de estado.													
			Yo como	cliente	necesito	realizar un pedido,	para poder	adquirir productos del menú de forma digital.	HU_71	Yo como cliente necesito realizar un pedido, para poder adquirir productos del menú de forma digital.	HU_71_01	El cliente puede seleccionar productos del catálogo y agregar al carrito.													
											HU_71_02	El sistema debe mostrar el total del pedido antes de confirmar.													
											HU_71_03	Al confirmar, el sistema genera un código de pedido y notifica a cocina.													
			Yo como	cliente	necesito	consultar el estado de mis pedidos,	para poder	saber en qué etapa se encuentra mi pedido.	HU_72	Yo como cliente necesito consultar el estado de mis pedidos, para poder saber en qué etapa se encuentra mi pedido.	HU_72_01	El cliente puede ver sus pedidos activos e historial.													
											HU_72_02	Cada pedido muestra: código, productos, total y estado actual.													
											HU_72_03	El estado se actualiza en tiempo real.													
			Yo como	cliente	necesito	cancelar un pedido,	para poder	anular mi solicitud si cambié de opinión.	HU_73	Yo como cliente necesito cancelar un pedido, para poder anular mi solicitud si cambié de opinión.	HU_73_01	El cliente solo puede cancelar un pedido dentro de los primeros 5 minutos después de haber sido realizado.													
											HU_73_02	El cliente debe ingresar un motivo de cancelación.													
											HU_73_03	El sistema debe confirmar la cancelación y actualizar el estado del pedido.													
			Yo como	domiciliario	necesito	consultar los pedidos asignados,	para poder	conocer las entregas que debo realizar.	HU_74	Yo como domiciliario necesito consultar los pedidos asignados, para poder conocer las entregas que debo realizar.	HU_74_01	El domiciliario ve únicamente los pedidos asignados a él con estado 'Listo' o 'En camino'.													
											HU_74_02	Cada pedido muestra: dirección, cliente, productos y observaciones.													
											HU_74_03	El sistema debe mostrar los pedidos ordenados por prioridad o proximidad.													
			Yo como	domiciliario	necesito	actualizar el estado de un pedido,	para poder	reportar el avance de la entrega.	HU_75	Yo como domiciliario necesito actualizar el estado de un pedido, para poder reportar el avance de la entrega.	HU_75_01	El domiciliario puede cambiar el estado a 'En camino' o 'Entregado'.													
											HU_75_02	El sistema registra la hora exacta de cada cambio de estado.													
											HU_75_03	Al marcar como 'Entregado', el sistema cierra el pedido automáticamente.													
			Yo como	cocinero	necesito	consultar los pedidos en cocina,	para poder	ver los pedidos que debo preparar.	HU_76	Yo como cocinero necesito consultar los pedidos en cocina, para poder ver los pedidos que debo preparar.	HU_76_01	El cocinero ve los pedidos con estado 'Recibido' o 'En preparación'.													
											HU_76_02	Cada pedido muestra: código, productos con cantidades y observaciones especiales.													
											HU_76_03	Los pedidos se muestran ordenados por hora de recepción.													
			Yo como	cocinero	necesito	marcar un pedido como listo,	para poder	notificar que la preparación está completa.	HU_77	Yo como cocinero necesito marcar un pedido como listo, para poder notificar que la preparación está completa.	HU_77_01	El cocinero puede cambiar el estado del pedido de 'En preparación' a 'Listo'.													
											HU_77_02	El sistema notifica al domiciliario y al administrador cuando el pedido está listo.													
											HU_77_03	El sistema registra la hora en que el pedido fue marcado como listo.													
	Gestión de Ventas	Yo como administrador necesito consultar y analizar las ventas realizadas.	Yo como	administrador	necesito	consultar el historial de ventas,	para poder	revisar las transacciones realizadas.	HU_78	Yo como administrador necesito consultar el historial de ventas, para poder revisar las transacciones realizadas.	HU_78_01	La lista de ventas muestra: fecha, cliente, productos, total y estado del pago.													
											HU_78_02	Debe haber opción para filtrar por rango de fechas, cliente, producto o estado.													
											HU_78_03	El sistema debe mostrar el total acumulado de ventas del período seleccionado.													
			Yo como	administrador	necesito	generar reportes de ventas,	para poder	obtener análisis estadísticos de las ventas del negocio.	HU_79	Yo como administrador necesito generar reportes de ventas, para poder obtener análisis estadísticos de las ventas del negocio.	HU_79_01	El reporte puede generarse por: día, semana, mes, producto, cliente o transacción.													
											HU_79_02	El reporte debe incluir: total de ventas, productos más vendidos, ticket promedio.													
											HU_79_03	El reporte debe ser exportable en formato PDF o Excel.													
06. Medición y Desempeño	Medición y Desempeño	Yo como administrador necesito generar reportes y estadísticas del negocio.	Yo como	administrador	necesito	visualizar el dashboard de indicadores,	para poder	tener una vista global del desempeño del negocio.	HU_84	Yo como administrador necesito visualizar el dashboard de indicadores, para poder tener una vista global del desempeño del negocio.	HU_84_01	El dashboard muestra métricas clave: ventas del día, pedidos activos, insumos agotados y clientes nuevos.													
											HU_84_02	Las métricas se actualizan en tiempo real.													
											HU_84_03	El administrador puede personalizar qué métricas desea ver en el dashboard.													
			Yo como	administrador	necesito	generar reportes de ventas,	para poder	analizar el comportamiento de las ventas en el tiempo.	HU_85	Yo como administrador necesito generar reportes de ventas, para poder analizar el comportamiento de las ventas en el tiempo.	HU_85_01	El reporte puede filtrarse por: período (día, semana, mes), producto y cliente.													
											HU_85_02	El reporte incluye gráficas de barras o líneas con la evolución de ventas.													
											HU_85_03	El reporte es exportable en PDF o Excel.													
			Yo como	administrador	necesito	generar reportes de compras,	para poder	analizar el gasto en insumos y su relación con las ventas.	HU_86	Yo como administrador necesito generar reportes de compras, para poder analizar el gasto en insumos y su relación con las ventas.	HU_86_01	El reporte puede filtrarse por: período, proveedor e insumo.													
											HU_86_02	El reporte incluye: total comprado, costo por categoría y comparativo mensual.													
											HU_86_03	El reporte es exportable en PDF o Excel.													
			Yo como	administrador	necesito	generar reportes de usuarios y clientes,	para poder	analizar la actividad de usuarios y clientes del sistema.	HU_87	Yo como administrador necesito generar reportes de usuarios y clientes, para poder analizar la actividad de usuarios y clientes del sistema.	HU_87_01	El reporte incluye: usuarios activos, clientes nuevos por período y top clientes por volumen de pedidos.													
											HU_87_02	Puede filtrarse por rango de fechas y tipo de usuario.													
											HU_87_03	El reporte es exportable en PDF o Excel.													
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									
																									