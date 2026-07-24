Planteamiento del problema a resolver:   

Descripción de la Empresa
Chazin Food es una compañía de comidas rápidas ubicada en el barrio Belén en la dirección Calle 21 #80 21, de la ciudad de Medellín; que ofrece comestibles como pollo, salchipapa, hamburguesa, perros calientes y muchos más que son de muy buena calidad y a un precio favorable para el público de la ciudad. La empresa comenzó a tomar forma desde hace algunos meses partiendo desde un pequeño negocio que comenzó a través del hermano mayor del cliente, pero tuvieron dificultades porque no lograban conseguir buenas ventas, debido a la ubicación del local, por lo tanto, cambiaron el punto físico de atención y también surgieron algunas ideas en cuanto al punto de ubicación, los comestibles, el manejo de las ventas y desde allí nació Chazin Food.
Problemas Actuales en los Procesos:
La problemática identificada en la empresa se centra en la alta dependencia de procesos manuales para la gestión de compras, pedidos, ventas e inventario de insumos. Actualmente, los pedidos son registrados por los empleados en un cuaderno de forma física o a través de solicitudes recibidas mediante la aplicación WhatsApp.
Adicionalmente, no se pueden generar reportes, estadísticas y métricas en tiempo real, afectando la capacidad de la empresa para realizar análisis, tomar decisiones y planificar sus operaciones.
Asimismo, la empresa no cuenta con un control adecuado del proceso de producción, lo que dificulta el seguimiento de las cantidades preparadas,  el consumo de insumos y el cumplimiento de las fichas técnicas de los productos. Esta situación genera desperdicios, inconsistencias en la preparación de los alimentos y dificultades para planificar la producción de acuerdo con la demanda del negocio. 
Consecuencias:
●	No se entrega el pedido a tiempo al cliente.
●	Al cliente se le entregan productos que no solicitó.
●	Se genera desperdicio de alimentos en la preparación del producto.
●	Se pierde la trazabilidad de lo que el cliente solicitó.
●	No es confiable la información del inventario de la materia prima.
●	El dinero recaudado no siempre corresponde a la cantidad de productos vendidos.
●	Se dificulta la lectura del contenido del pedido cuando se realiza manualmente.
●	Se genera insatisfacción del cliente.
●	Se pierde la trazabilidad de la compra.



Objetivos del Proyecto:

General:
Desarrollar una aplicación web y móvil para la empresa Chazin Food que gestione los procesos de compras,  producción y ventas, de acuerdo con las políticas de la empresa.


Específicos:
●	Administrar la configuración de roles y permisos de acuerdo con las políticas de la empresa. 
●	 Gestionar el proceso de usuarios de acuerdo con la seguridad del aplicativo. 
●	Gestionar el proceso de compras de acuerdo con las necesidades de la empresa.
●	Administrar el proceso de producción de acuerdo con las necesidades de la empresa.
●	Gestionar el proceso de ventas de acuerdo con las necesidades de la empresa.
●	Medir la gestión del desempeño del negocio de acuerdo con las políticas de la empresa.
Alcance:
 
Proceso de Configuración
●        Subproceso de roles: este proceso permitirá registrar, consultar, actualizar y cambiar el estado de los roles con los respectivos permisos asociados para tener acceso a los procesos y su funcionalidad dentro del aplicativo.
Proceso de Usuarios
●        Subproceso de gestión de usuarios: este proceso permitirá registrar, consultar, actualizar y cambiar el estado de la información de los usuarios y la generación de reportes de los usuarios. Este subproceso corresponde a los usuarios internos del negocio, es decir, los empleados.
●        Subproceso de gestión de acceso: este subproceso administrará el acceso de los usuarios. Incluye las actividades de autenticación (inicio de sesión), recuperación y/o restablecimiento de contraseña, cierre de sesión.
Proceso de Compras
●        Subproceso Categoría de Insumos: (Administrador) Este subproceso será administrado exclusivamente por los usuarios con rol Administrador, quienes podrán crear, consultar, actualizar y eliminar las categorías de insumos, tales como frutas, verduras, proteínas, carbohidratos, entre otras. Su finalidad es permitiendo la consistencia del catálogo maestro de categorías y mantener una estructura de clasificación controlada que asegure la integridad de la información registrada.
●         Subproceso Gestión de Insumos: Este subproceso controla la gestión de los insumos del negocio, tales como frutas, vegetales, panes, carnes, entre otros. Permitirá registrar, consultar, actualizar y eliminar insumos, así como modificar su estado operativo (disponible o agotado), según la cantidad existente en el momento. Además, contempla insumos elaborados por el mismo negocio, los cuales contarán con una ficha técnica para detallar su preparación, ingredientes y características, manejo de stock y stock mínimo.
 
Nota: Existen insumos que no se van a manejar con control de stock (Salsas, verduras etc..).
 
●        Gestión de insumos no conformes: Este subproceso permitirá visualizar todos los insumos o productos que no cumplen con las condiciones para la producción o venta (dar de baja a un insumo o producto).
●        Subproceso Gestión de Proveedores: este subproceso permite registrar, consultar, actualizar y eliminar información de los proveedores los cuales pueden ser naturales y jurídicos. Estas acciones son exclusivas del Administrador.
●        Subproceso Gestión de Compras: este subproceso permite agregar, consultar y anular las compras; sin embargo, las acciones asociadas al anular las compras estarán restringidas exclusivamente al rol de administrador.
Proceso de Producción
●        Subproceso Categoría de Productos: este subproceso permitirá crear nuevas categorías, consultar las existentes, actualizar su información y eliminarlas cuando sea necesario.
●        Subproceso Gestión de Productos: este subproceso permitirá crear nuevos productos, consultar los existentes, actualizar su información y eliminarlos cuando sea necesario.
●         Ficha Técnica de Producto: este subproceso se encarga de registrar, consultar, actualizar y eliminar la ficha técnica de cada producto que se produce en el negocio tales como: perros calientes, hamburguesas, salchipapas, entre otros; los cuales incluyen datos como el nombre del producto, los ingredientes, la presentación, las imágenes y recetas entre otros.
Se va a incluir el versionamiento de la ficha técnica con base a que Chazin Food tiene             	eventos de temporada dónde el producto puede variar su forma de elaboración e inclusive sus ingredientes, es decir, diferentes versiones.
●        Gestión de producción: este proceso se activará una vez que el cliente ha pagado su producto, desde la venta se generará una orden de producción hacia la cocina en cola por orden de llegada. Los cocineros podrán observar desde un computador todas las órdenes de producción, tomarán la orden para elaborarla y el sistema imprimirá el ticket de producción. El estado de la orden es cambiado automáticamente por el sistema “en producción”.
Una vez elaborado el producto, el cocinero cambia el estado de la orden de producción “a elaborado”, se llama al cliente, y una vez que se entrega se cambia el estado en el sistema a “entregado”.
En el caso de pedidos a domicilio, una vez que llega el despachador y se le entregan los productos el estado del pedido es cambiado a “despachado”. El despachador informa la entrega al cliente, cambiando el estado a “entregado”.
 
Proceso de Ventas
●        Gestión de clientes: este subproceso permite administrar la información de los clientes del negocio de comidas rápidas, facilitando el registro, consulta, actualización y visualización de sus datos. Además, permitirá llevar un control de la fidelidad de los clientes mediante el historial de compras y frecuencia de consumo, con el fin de identificar clientes frecuentes y otorgar beneficios, promociones o descuentos especiales ofrecidos por el negocio.
La fidelización está definida por un cliente que después de su tercera compra tendrá un 30% de descuento en la siguiente compra, y así sucesivamente en cada 3 compras, sin importar la cantidad de productos, esto está definido dentro de las políticas de la empresa.
 
●        Subproceso Gestión de Ventas: este subproceso permite gestionar las ventas directas en el local y online por la web; es decir, que el pedido cambia de estado a pagado. Adicionalmente, se podrán consultar y generar reportes sobre las ventas realizadas, incluyendo información relacionada con el historial de ventas, los productos vendidos, el cliente asociado y el detalle de cada transacción.
El aplicativo contempla pagos por pasarela, por lo que no se manejan pedidos, sino ventas (productos por entregar).
Proceso de Medición y Desempeño
●        Subproceso Medición y Desempeño: Permite monitorear y evaluar el desempeño de Chazin Food mediante reportes, estadísticas y gráficas sobre ventas por día, semana, mes y año, cantidad de usuarios, productos más vendidos y favoritos de los clientes, así como observaciones y comentarios recibidos. Su propósito es apoyar la toma de decisiones estratégicas y promover la mejora continua de los procesos y productos del negocio.
