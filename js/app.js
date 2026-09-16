let productos = JSON.parse(localStorage.getItem("productosPetMarket")) || [];
let carritoVenta = JSON.parse(localStorage.getItem("carritoVentaPetMarket")) || [];
let historialVentas = JSON.parse(localStorage.getItem("historialVentasPetMarket")) || [];

const formProducto = document.getElementById("formProducto");
const codigoInput = document.getElementById("codigo");
const nombreInput = document.getElementById("nombre");
const tipoMascotaInput = document.getElementById("tipoMascota");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const buscarProductoInput = document.getElementById("buscarProducto");
const filtroMascotaInput = document.getElementById("filtroMascota");
const tablaProductos = document.getElementById("tablaProductos");
const productoVentaInput = document.getElementById("productoVenta");
const cantidadVentaInput = document.getElementById("cantidadVenta");
const btnAgregarVenta = document.getElementById("btnAgregarVenta");
const btnConfirmarVenta = document.getElementById("btnConfirmarVenta");
const tablaVenta = document.getElementById("tablaVenta");
const totalVentaElement = document.getElementById("totalVenta");
const tablaHistorial = document.getElementById("tablaHistorial");
const mensaje = document.getElementById("mensaje");
const totalProductosElement = document.getElementById("totalProductos");
const productosStockBajoElement = document.getElementById("productosStockBajo");
const productosVentaElement = document.getElementById("productosVenta");
const totalVendidoElement = document.getElementById("totalVendido");


function guardarProductos() {
    localStorage.setItem("productosPetMarket", JSON.stringify(productos));
}

function guardarCarrito() {
    localStorage.setItem("carritoVentaPetMarket", JSON.stringify(carritoVenta));
}

function guardarHistorial() {
    localStorage.setItem("historialVentasPetMarket", JSON.stringify(historialVentas));
}


function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;

    setTimeout(() => {
        mensaje.className = "mensaje";
        mensaje.textContent = "";
    }, 3500);
}


/* =========================================
   BLOQUEAR CARACTERES NO VALIDOS EN PRECIO
========================================= */

precioInput.addEventListener("keydown", function(event) {

    if (
        event.key === "-" ||
        event.key === "+" ||
        event.key === "e"
    ) {
        event.preventDefault();
    }

});


function validarProducto(codigo, nombre, tipoMascota, precio, stock) {

    if (codigo.trim() === "") {
        return "El código es obligatorio.";
    }

    if (!/^[A-Za-z0-9-]+$/.test(codigo.trim())) {
        return "El código solo puede contener letras, números y guiones.";
    }

    const codigoExiste = productos.some(
        p => p.codigo.toLowerCase() === codigo.trim().toLowerCase()
    );

    if (codigoExiste) {
        return "El código ingresado ya existe.";
    }

    if (nombre.trim() === "") {
        return "El nombre del producto es obligatorio.";
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,()-]+$/.test(nombre.trim())) {
        return "El nombre contiene caracteres no permitidos.";
    }

    if (tipoMascota === "") {
        return "Debes seleccionar el tipo de mascota.";
    }

    /* VALIDACION DEL PRECIO */
    if (isNaN(precio) || precio <= 0) {
        return "El precio debe ser mayor que 0.";
    }

    if (!Number.isInteger(stock) || stock < 0) {
        return "El stock debe ser un número entero mayor o igual a 0.";
    }

    return null;
}


formProducto.addEventListener("submit", function(event) {

    event.preventDefault();

    const codigo = codigoInput.value.trim();
    const nombre = nombreInput.value.trim();
    const tipoMascota = tipoMascotaInput.value;
    const precio = Number(precioInput.value);
    const stock = Number(stockInput.value);

    const error = validarProducto(
        codigo,
        nombre,
        tipoMascota,
        precio,
        stock
    );

    if (error) {
        mostrarMensaje(error, "error");
        return;
    }

    const nuevoProducto = {
        id: Date.now(),
        codigo,
        nombre,
        tipoMascota,
        precio,
        stock
    };

    productos.push(nuevoProducto);

    guardarProductos();

    formProducto.reset();

    renderizarTodo();

    mostrarMensaje(
        "Producto registrado correctamente.",
        "exito"
    );
});


function renderizarProductos() {

    const textoBusqueda =
        buscarProductoInput.value.trim().toLowerCase();

    const filtroMascota =
        filtroMascotaInput.value;

    const productosFiltrados = productos.filter(p => {

        const coincideNombre =
            p.nombre.toLowerCase().includes(textoBusqueda);

        const coincideMascota =
            filtroMascota === "Todos" ||
            p.tipoMascota === filtroMascota;

        return coincideNombre && coincideMascota;
    });

    tablaProductos.innerHTML = "";

    if (productosFiltrados.length === 0) {

        tablaProductos.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No se encontraron productos.
                </td>
            </tr>
        `;

        return;
    }

    productosFiltrados.forEach(producto => {

        let estado = "";
        let claseStock = "";

        if (producto.stock === 0) {
            estado = "Agotado";
            claseStock = "stock-agotado";
        }
        else if (producto.stock <= 5) {
            estado = "Stock bajo";
            claseStock = "stock-bajo";
        }
        else {
            estado = "Disponible";
            claseStock = "stock-normal";
        }

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.nombre}</td>
            <td>${producto.tipoMascota}</td>
            <td>S/ ${producto.precio.toFixed(2)}</td>
            <td class="${claseStock}">
                ${producto.stock}
            </td>
            <td class="${claseStock}">
                ${estado}
            </td>
            <td>
                <button
                    class="btn btn-danger btn-small"
                    onclick="eliminarProducto(${producto.id})"
                >
                    🗑️ Eliminar
                </button>
            </td>
        `;

        tablaProductos.appendChild(fila);
    });
}


function eliminarProducto(id) {

    const productoEnVenta =
        carritoVenta.some(
            item => item.productoId === id
        );

    if (productoEnVenta) {
        mostrarMensaje(
            "No puedes eliminar un producto que está en la venta actual.",
            "error"
        );

        return;
    }

    const producto =
        productos.find(p => p.id === id);

    if (!producto) {
        return;
    }

    const confirmar =
        confirm(`¿Deseas eliminar "${producto.nombre}"?`);

    if (!confirmar) {
        return;
    }

    productos =
        productos.filter(
            p => p.id !== id
        );

    guardarProductos();

    renderizarTodo();

    mostrarMensaje(
        "Producto eliminado correctamente.",
        "exito"
    );
}


function cargarProductosVenta() {

    productoVentaInput.innerHTML = `
        <option value="">
            Selecciona un producto
        </option>
    `;

    productos.forEach(producto => {

        if (producto.stock > 0) {

            const option =
                document.createElement("option");

            option.value = producto.id;

            option.textContent =
                `${producto.nombre} - S/ ${producto.precio.toFixed(2)} (Stock: ${producto.stock})`;

            productoVentaInput.appendChild(option);
        }
    });
}


btnAgregarVenta.addEventListener("click", function() {

    const productoId =
        Number(productoVentaInput.value);

    const cantidad =
        Number(cantidadVentaInput.value);

    if (!productoId) {
        mostrarMensaje(
            "Selecciona un producto.",
            "error"
        );

        return;
    }

    if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {
        mostrarMensaje(
            "La cantidad debe ser un número entero mayor que 0.",
            "error"
        );

        return;
    }

    const producto =
        productos.find(
            p => p.id === productoId
        );

    if (!producto) {
        mostrarMensaje(
            "El producto no existe.",
            "error"
        );

        return;
    }

    const itemExistente =
        carritoVenta.find(
            item => item.productoId === productoId
        );

    const cantidadActual =
        itemExistente
            ? itemExistente.cantidad
            : 0;

    if (
        cantidadActual + cantidad >
        producto.stock
    ) {
        mostrarMensaje(
            `No puedes vender más de ${producto.stock} unidades disponibles.`,
            "error"
        );

        return;
    }

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    }
    else {
        carritoVenta.push({
            productoId: producto.id,
            cantidad
        });
    }

    guardarCarrito();

    renderizarVenta();

    productoVentaInput.value = "";

    cantidadVentaInput.value = 1;

    mostrarMensaje(
        "Producto agregado a la venta.",
        "exito"
    );
});


function renderizarVenta() {

    tablaVenta.innerHTML = "";

    if (carritoVenta.length === 0) {

        tablaVenta.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No hay productos en la venta.
                </td>
            </tr>
        `;

        totalVentaElement.textContent =
            "S/ 0.00";

        return;
    }

    let total = 0;

    carritoVenta.forEach(item => {

        const producto =
            productos.find(
                p => p.id === item.productoId
            );

        if (!producto) {
            return;
        }

        const subtotal =
            producto.precio * item.cantidad;

        total += subtotal;

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td>${producto.nombre}</td>

            <td>${item.cantidad}</td>

            <td>
                S/ ${producto.precio.toFixed(2)}
            </td>

            <td>
                S/ ${subtotal.toFixed(2)}
            </td>

            <td>
                <button
                    class="btn btn-danger btn-small"
                    onclick="eliminarDeVenta(${producto.id})"
                >
                    🗑️ Quitar
                </button>
            </td>
        `;

        tablaVenta.appendChild(fila);
    });

    totalVentaElement.textContent =
        `S/ ${total.toFixed(2)}`;
}


function eliminarDeVenta(productoId) {

    carritoVenta =
        carritoVenta.filter(
            item => item.productoId !== productoId
        );

    guardarCarrito();

    renderizarVenta();

    mostrarMensaje(
        "Producto quitado de la venta.",
        "exito"
    );
}


btnConfirmarVenta.addEventListener("click", function() {

    if (carritoVenta.length === 0) {

        mostrarMensaje(
            "No hay productos en la venta.",
            "error"
        );

        return;
    }

    let total = 0;

    const productosVendidos = [];

    for (const item of carritoVenta) {

        const producto =
            productos.find(
                p => p.id === item.productoId
            );

        if (!producto) {

            mostrarMensaje(
                "Uno de los productos ya no existe.",
                "error"
            );

            return;
        }

        if (item.cantidad > producto.stock) {

            mostrarMensaje(
                `No hay suficiente stock de ${producto.nombre}.`,
                "error"
            );

            return;
        }

        const subtotal =
            producto.precio * item.cantidad;

        total += subtotal;

        productosVendidos.push({
            nombre: producto.nombre,
            cantidad: item.cantidad,
            subtotal
        });
    }

    const confirmar =
        confirm(
            `¿Confirmar venta por S/ ${total.toFixed(2)}?`
        );

    if (!confirmar) {
        return;
    }

    carritoVenta.forEach(item => {

        const producto =
            productos.find(
                p => p.id === item.productoId
            );

        producto.stock -= item.cantidad;
    });

    const nuevaVenta = {
        id: Date.now(),
        fecha: new Date().toLocaleString("es-PE"),
        productos: productosVendidos,
        total
    };

    historialVentas.unshift(nuevaVenta);

    guardarProductos();

    guardarHistorial();

    carritoVenta = [];

    guardarCarrito();

    renderizarTodo();

    mostrarMensaje(
        "Venta realizada correctamente. El stock fue actualizado.",
        "exito"
    );
});


function renderizarHistorial() {

    tablaHistorial.innerHTML = "";

    if (historialVentas.length === 0) {

        tablaHistorial.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;">
                    No hay ventas registradas.
                </td>
            </tr>
        `;

        return;
    }

    historialVentas.forEach(venta => {

        const nombresProductos =
            venta.productos
                .map(
                    p => `${p.nombre} x${p.cantidad}`
                )
                .join(", ");

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td>${venta.fecha}</td>

            <td>${nombresProductos}</td>

            <td>
                <strong>
                    S/ ${venta.total.toFixed(2)}
                </strong>
            </td>
        `;

        tablaHistorial.appendChild(fila);
    });
}


function actualizarDashboard() {

    totalProductosElement.textContent =
        productos.length;

    const stockBajo =
        productos.filter(
            p => p.stock <= 5
        ).length;

    productosStockBajoElement.textContent =
        stockBajo;

    productosVentaElement.textContent =
        carritoVenta.reduce(
            (t, item) => t + item.cantidad,
            0
        );

    const totalVendido =
        historialVentas.reduce(
            (t, v) => t + v.total,
            0
        );

    totalVendidoElement.textContent =
        `S/ ${totalVendido.toFixed(2)}`;
}


function renderizarTodo() {

    renderizarProductos();

    cargarProductosVenta();

    renderizarVenta();

    renderizarHistorial();

    actualizarDashboard();
}


buscarProductoInput.addEventListener(
    "input",
    renderizarProductos
);

filtroMascotaInput.addEventListener(
    "change",
    renderizarProductos
);


function cargarDatosEjemplo() {

    if (productos.length > 0) {
        return;
    }

    productos = [
        {
            id: 1,
            codigo: "DOG001",
            nombre: "Alimento Premium para Perro",
            tipoMascota: "Perro",
            precio: 65.90,
            stock: 15
        },
        {
            id: 2,
            codigo: "CAT001",
            nombre: "Alimento Premium para Gato",
            tipoMascota: "Gato",
            precio: 58.50,
            stock: 10
        },
        {
            id: 3,
            codigo: "AVE001",
            nombre: "Semillas para Ave",
            tipoMascota: "Ave",
            precio: 18.90,
            stock: 25
        },
        {
            id: 4,
            codigo: "PEZ001",
            nombre: "Alimento para Peces",
            tipoMascota: "Pez",
            precio: 12.50,
            stock: 4
        },
        {
            id: 5,
            codigo: "CON001",
            nombre: "Alimento para Conejo",
            tipoMascota: "Conejo",
            precio: 28.90,
            stock: 8
        }
    ];

    guardarProductos();
}


cargarDatosEjemplo();

renderizarTodo();