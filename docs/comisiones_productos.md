POST /api/v1/comisiones/config                                
                                                                                                                                          
  Auth: RequireAdmin · Status: 201                                                                                                        
                                                                                                                                          
  Request body:                                                                                                                           
  {                                                                                                                                       
    "producto_id": 5,                                       
    "precio_barra": 3400.00
  }                                                                                                                                       
   
  Validaciones:                                                                                                                           
  - precio_barra ≥ 0                                                                                                                      
  - precio_barra ≤ producto.precio (precio de venta al cliente)
  - El producto debe pertenecer al mismo billar                                                                                           
  - No puede existir otra config activa para ese producto en el mismo billar                                                              
                                                                                                                                          
  Response 201:                                                                                                                           
  {                                                                                                                                       
    "success": true,                                                                                                                      
    "message": "Configuración de comisión creada",          
    "data": {                                                                                                                             
      "id": 1,
      "billar_id": 2,                                                                                                                     
      "producto_id": 5,                                     
      "precio_barra": 3400.00,
      "activa": true                                                                                                                      
    }
  }                                                                                                                                       
                                                            
  Errores posibles:

  ┌────────┬──────────────────────┬────────────────────────────────────┐                                                                  
  │ Status │         code         │               Cuándo               │
  ├────────┼──────────────────────┼────────────────────────────────────┤                                                                  
  │ 404    │ PRODUCTO_NOT_FOUND   │ producto_id no existe              │
  ├────────┼──────────────────────┼────────────────────────────────────┤
  │ 422    │ PRODUCTO_OTRO_BILLAR │ producto es de otro billar         │                                                                  
  ├────────┼──────────────────────┼────────────────────────────────────┤                                                                  
  │ 422    │ PRECIO_BARRA_MAYOR   │ precio_barra > precio del producto │                                                                  
  ├────────┼──────────────────────┼────────────────────────────────────┤                                                                  
  │ 422    │ COMISION_DUPLICADA   │ ya existe config para ese producto │
  └────────┴──────────────────────┴────────────────────────────────────┘                                                                  
                                                            
  ---                                                                                                                                     
  GET /api/v1/comisiones/config                             

  Auth: RequireCajero

  Query params:

  ┌──────────────┬──────┬─────────┬─────────────────────────────────────┐                                                                 
  │    Param     │ Tipo │ Default │             Descripción             │
  ├──────────────┼──────┼─────────┼─────────────────────────────────────┤                                                                 
  │ solo_activas │ bool │ false   │ Filtra solo configs con activa=true │
  └──────────────┴──────┴─────────┴─────────────────────────────────────┘
                                                                                                                                          
  Request: sin body                                                                                                                       
                                                                                                                                          
  Response 200:                                                                                                                           
  {                                                         
    "success": true,
    "data": [       
      {      
        "id": 1,
        "billar_id": 2,
        "producto_id": 5,
        "precio_barra": 3400.00,
        "activa": true                                                                                                                    
      },              
      {                                                                                                                                   
        "id": 2,                                            
        "billar_id": 2,
        "producto_id": 8,
        "precio_barra": 5000.00,
        "activa": false                                                                                                                   
      }
    ]                                                                                                                                     
  }                                                         

  ---
  PATCH /api/v1/comisiones/config/{config_id}
                                                                                                                                          
  Auth: RequireAdmin
                                                                                                                                          
  Path param: config_id — ID de la configuración                                                                                          
   
  Request body (todos opcionales, se envía solo lo que cambia):                                                                           
  {                                                         
    "precio_barra": 3500.00,                                                                                                              
    "activa": false                                         
  }                                                                                                                                       
   
  Validación: si se envía precio_barra, debe ser ≤ precio del producto asociado.                                                          
                                                                                                                                          
  Response 200:
  {                                                                                                                                       
    "success": true,                                        
    "message": "Configuración actualizada",
    "data": {                              
      "id": 1,                                                                                                                            
      "billar_id": 2,
      "producto_id": 5,                                                                                                                   
      "precio_barra": 3500.00,                              
      "activa": false         
    }                
  }
                                                                                                                                          
  Errores posibles:
                                                                                                                                          
  ┌────────┬─────────────────────────────────┬──────────────────────────────────────────┐
  │ Status │              code               │                  Cuándo                  │
  ├────────┼─────────────────────────────────┼──────────────────────────────────────────┤
  │ 404    │ CONFIGURACIONCOMISION_NOT_FOUND │ config_id no existe o es de otro billar  │
  ├────────┼─────────────────────────────────┼──────────────────────────────────────────┤
  │ 422    │ PRECIO_BARRA_MAYOR              │ nuevo precio_barra > precio del producto │                                                 
  └────────┴─────────────────────────────────┴──────────────────────────────────────────┘
                                                                                                                                          
  ---                                                       
  DELETE /api/v1/comisiones/config/{config_id}
                                                                                                                                          
  Auth: RequireAdmin
                                                                                                                                          
  Path param: config_id                                     

  Request: sin body

  Response 200:
  {
    "success": true,
    "message": "Configuración desactivada"
  }                                       
                                                                                                                                          
  ▎ Nota: es un soft delete — pone activa = false, no elimina el registro. Los productos sin config activa no generan comisiones.
                                                                                                                                          
  Errores posibles:                                         
                                                                                                                                          
  ┌────────┬─────────────────────────────────┬─────────────────────────────────────────┐                                                  
  │ Status │              code               │                 Cuándo                  │
  ├────────┼─────────────────────────────────┼─────────────────────────────────────────┤                                                  
  │ 404    │ CONFIGURACIONCOMISION_NOT_FOUND │ config_id no existe o es de otro billar │
  └────────┴─────────────────────────────────┴─────────────────────────────────────────┘

  ---
  GET /api/v1/comisiones/ventas
                                                                                                                                          
  Auth: RequireCajero
                                                                                                                                          
  Query params:                                             

  ┌───────────────┬────────┬─────────┬────────────────────────────┐
  │     Param     │  Tipo  │ Default │        Descripción         │
  ├───────────────┼────────┼─────────┼────────────────────────────┤
  │ mesera_id     │ int    │ —       │ Filtra por mesera          │
  ├───────────────┼────────┼─────────┼────────────────────────────┤
  │ turno_caja_id │ int    │ —       │ Filtra por turno de caja   │
  ├───────────────┼────────┼─────────┼────────────────────────────┤
  │ status        │ string │ —       │ pendiente o pagada         │
  ├───────────────┼────────┼─────────┼────────────────────────────┤                                                                       
  │ page          │ int    │ 1       │ Página                     │
  ├───────────────┼────────┼─────────┼────────────────────────────┤                                                                       
  │ page_size     │ int    │ 20      │ Ítems por página (máx 100) │
  └───────────────┴────────┴─────────┴────────────────────────────┘                                                                       
   
  Response 200:                                                                                                                           
  {                                                         
    "success": true,
    "data": {       
      "items": [
        {       
          "id": 10,                                                                                                                       
          "factura_id": 55,
          "mesera_id": 3,                                                                                                                 
          "mesera_nombre": "Ana García",                    
          "producto_id": 5,             
          "producto_nombre_snapshot": "Cerveza Club Colombia",                                                                            
          "origen_tipo": "CONSUMO_JUEGO",                     
          "origen_id": 22,                                                                                                                
          "cantidad": 2,                                                                                                                  
          "precio_venta": 3500.00,
          "precio_barra": 3400.00,                                                                                                        
          "comision_unitaria": 100.00,                                                                                                    
          "comision_total": 200.00,   
          "status": "pendiente",                                                                                                          
          "fecha_hora": "2026-05-02T21:30:00Z"              
        }                                                                                                                                 
      ],                                                                                                                                  
      "total": 42,                                                                                                                        
      "page": 1,                                                                                                                          
      "page_size": 20                                       
    }
  }

  ---
  GET /api/v1/comisiones/ventas/resumen
                                                                                                                                          
  Auth: RequireCajero
                                                                                                                                          
  Query params:                                             

  ┌───────────────┬──────┬─────────┬──────────────────────────────────────────────┐
  │     Param     │ Tipo │ Default │                 Descripción                  │
  ├───────────────┼──────┼─────────┼──────────────────────────────────────────────┤
  │ turno_caja_id │ int  │ —       │ Filtra por turno (omitir = todos los turnos) │
  └───────────────┴──────┴─────────┴──────────────────────────────────────────────┘
                                                                                                                                          
  Response 200:
  {                                                                                                                                       
    "success": true,                                        
    "data": [       
      {      
        "mesera_id": 3,
        "mesera_nombre": "Ana García",
        "total_ventas": 15,           
        "total_comision": 1500.00,
        "comision_pendiente": 800.00                                                                                                      
      },                            
      {                                                                                                                                   
        "mesera_id": 7,                                     
        "mesera_nombre": "Laura Pérez",
        "total_ventas": 8,                                                                                                                
        "total_comision": 600.00,
        "comision_pendiente": 600.00                                                                                                      
      }                                                     
    ]                                                                                                                                     
  }
                                                                                                                                          
  ---                                                       
  PATCH /api/v1/comisiones/ventas/{comision_id}/pagar

  Auth: RequireAdmin

  Path param: comision_id                                                                                                                 
   
  Request: sin body                                                                                                                       
                                                            
  Response 200:
  {
    "success": true,
    "message": "Comisión marcada como pagada"
  }                                          
   
  Errores posibles:
                                                                                                                                          
  ┌────────┬─────────────────────────┬───────────────────────────────────────────┐
  │ Status │          code           │                  Cuándo                   │                                                        
  ├────────┼─────────────────────────┼───────────────────────────────────────────┤
  │ 404    │ COMISIONVENTA_NOT_FOUND │ comision_id no existe o es de otro billar │
  ├────────┼─────────────────────────┼───────────────────────────────────────────┤
  │ 422    │ YA_PAGADA               │ la comisión ya tenía status pagada        │
  └────────┴─────────────────────────┴───────────────────────────────────────────┘    


  Cómo funciona con productos existentes                                                                                                  
                                                                                                                                          
  No hay que tocar los productos. La tabla configuracion_comision es el mecanismo de activación. Si un producto tiene config activa →     
  genera comisión. Si no → factura normal.
                                                                                                                                          
  ---                                                       
  Flujo del admin para configurar comisiones
                                            
  1. Listar productos del billar
     GET /api/v1/productos?billar_id=2                                                                                                    
                                                                                                                                          
  2. Identificar cuáles vende la mesera con diferencia de precio                                                                          
     (ej: cervezas, licores)                                                                                                              
                                                                                                                                          
  3. Crear config para cada uno                             
     POST /api/v1/comisiones/config                                                                                                       
     { "producto_id": 5, "precio_barra": 3400 }             

  4. Listo — a partir de ese momento ese producto genera comisiones automáticamente                                                       
   
  ---                                                                                                                                     
  No necesitas un flag en el producto                       
                                                                                                                                          
  La tabla configuracion_comision ya cumple ese rol:
                                                                                                                                          
  ┌──────────────────────────┬─────────────────────────────────────────┐
  │          Estado          │            Lo que significa             │                                                                  
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ Sin config               │ Producto normal, sin comisión           │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ Config con activa: true  │ Genera comisión al vender               │                                                                  
  ├──────────────────────────┼─────────────────────────────────────────┤                                                                  
  │ Config con activa: false │ Desactivado temporalmente, sin comisión │                                                                  
  └──────────────────────────┴─────────────────────────────────────────┘                                                                  
                                                            
  Eso es equivalente a tener un switch por producto, pero con la ventaja de que también guarda el precio_barra.