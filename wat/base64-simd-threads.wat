(module
  (import "imports" "memory" (memory 0 1024 shared))

  (func $base642bytes (export "base642bytes")
    (param $start i32) (param $end i32)
    (local $i i32)
    (local $j i32)
    (local $x v128)
    (local.set $i (local.get $start))
    (local.set $j (local.get $start))

    (loop 
      local.get $i
      v128.load
      
      ;; convert base64 char code to number 0-63
      ;; x + 4 - (x > 64) * 69 - (x > 96) * 6 + (x === 43) * 15 + (x === 47) * 12
      local.set $x
      local.get $x
      (i8x16.splat (i32.const 4))
      i8x16.add

      (v128.and
        (i8x16.gt_u (local.get $x) (i8x16.splat (i32.const 64)))
        (i8x16.splat (i32.const 69))
      )
      i8x16.sub

      (v128.and
        (i8x16.gt_u (local.get $x) (i8x16.splat (i32.const 96)))
        (i8x16.splat (i32.const 6))
      )
      i8x16.sub

      (v128.and
        (i8x16.eq (local.get $x) (i8x16.splat (i32.const 43)))
        (i8x16.splat (i32.const 15))
      )
      i8x16.add

      (v128.and
        (i8x16.eq (local.get $x) (i8x16.splat (i32.const 47)))
        (i8x16.splat (i32.const 12))
      )
      i8x16.add

      ;; shift bytes around
      ;; NOTE: this is completely different from the JS version
      ;; because we have to operate on a little-endian i32x4 interpretation of the bytes
      ;; while in JS we construct an integer in big-endian fashion
      local.set $x

      ;; first byte

      local.get $x
      ;; 00000000,00000000,00000000,00111111
      v128.const i32x4 0x0000003f 0x0000003f 0x0000003f 0x0000003f
      v128.and
      i32.const 2
      i32x4.shl

      local.get $x
      ;; 00000000,00000000,00110000,00000000
      v128.const i32x4 0x00003000 0x00003000 0x00003000 0x00003000
      v128.and
      i32.const 12
      i32x4.shr_u

      v128.or

      ;; second byte

      local.get $x
      ;; 00000000,00000000,00001111,00000000
      v128.const i32x4 0x00000f00 0x00000f00 0x00000f00 0x00000f00
      v128.and
      i32.const 4
      i32x4.shl

      local.get $x
      ;; 00000000,00111100,00000000,00000000
      v128.const i32x4 0x003c0000 0x003c0000 0x003c0000 0x003c0000
      v128.and
      i32.const 10
      i32x4.shr_u

      v128.or
      v128.or

      ;; third byte

      local.get $x
      ;; 00000000,00000011,00000000,00000000
      v128.const i32x4 0x00030000 0x00030000 0x00030000 0x00030000
      v128.and
      i32.const 6
      i32x4.shl

      local.get $x
      ;; 00111111,00000000,00000000,00000000
      v128.const i32x4 0x3f000000 0x3f000000 0x3f000000 0x3f000000
      v128.and
      i32.const 8
      i32x4.shr_u

      v128.or
      v128.or

      v128.const i8x16 0 1 2 4 5 6 8 9 10 12 13 14 16 16 16 16
      i8x16.swizzle

      ;; store & jump to next 16 bytes
      local.set $x
      local.get $j
      local.get $x
      v128.store

      (local.set $i (i32.add (local.get $i) (i32.const 16)))
      (local.set $j (i32.add (local.get $j) (i32.const 12)))
      (i32.lt_u (local.get $i) (local.get $end))
      br_if 0
    )
  )

  (func $bytes2base64 (export "bytes2base64")
    (param $start i32) (param $end i32) (param $offset i32)
    (local $i i32)
    (local $j i32)
    (local $x v128)
    (local.set $i (local.get $offset))
    (local.set $j (local.get $start))

    (loop 
      local.get $j
      v128.load

      ;; shift bytes around
      v128.const i8x16 0 1 2 16 3 4 5 16 6 7 8 16 9 10 11 16
      i8x16.swizzle

      local.set $x

      ;; first byte

      local.get $x
      ;; 00000000,00000000,11111100
      v128.const i32x4 0x000000fc 0x000000fc 0x000000fc 0x000000fc
      v128.and
      i32.const 2
      i32x4.shr_u

      ;; second byte

      local.get $x
      ;; 00000000,00000000,00000011
      v128.const i32x4 0x00000003 0x00000003 0x00000003 0x00000003
      v128.and
      i32.const 12
      i32x4.shl

      local.get $x
      ;; 00000000,11110000,00000000
      v128.const i32x4 0x0000f000 0x0000f000 0x0000f000 0x0000f000
      v128.and
      i32.const 4
      i32x4.shr_u

      v128.or
      v128.or

      ;; third byte

      local.get $x
      ;; 00000000,00001111,00000000
      v128.const i32x4 0x00000f00 0x00000f00 0x00000f00 0x00000f00
      v128.and
      i32.const 10
      i32x4.shl

      local.get $x
      ;; 11000000,00000000,00000000
      v128.const i32x4 0x00c00000 0x00c00000 0x00c00000 0x00c00000
      v128.and
      i32.const 6
      i32x4.shr_u

      v128.or
      v128.or

      ;; fourth byte

      local.get $x
      ;; 00111111,00000000,00000000
      v128.const i32x4 0x003f0000 0x003f0000 0x003f0000 0x003f0000
      v128.and
      i32.const 8
      i32x4.shl

      v128.or
      
      ;; convert number 0-63 to base64 char code
      ;; x + 65 + (x > 25) * 6 - (x > 51) * 75 - (x === 62) * 15 - (x === 63) * 12
      local.set $x
      local.get $x
      (i8x16.splat (i32.const 65))
      i8x16.add

      (v128.and
        (i8x16.gt_u (local.get $x) (i8x16.splat (i32.const 25)))
        (i8x16.splat (i32.const 6))
      )
      i8x16.add

      (v128.and
        (i8x16.gt_u (local.get $x) (i8x16.splat (i32.const 51)))
        (i8x16.splat (i32.const 75))
      )
      i8x16.sub

      (v128.and
        (i8x16.eq (local.get $x) (i8x16.splat (i32.const 62)))
        (i8x16.splat (i32.const 15))
      )
      i8x16.sub

      (v128.and
        (i8x16.eq (local.get $x) (i8x16.splat (i32.const 63)))
        (i8x16.splat (i32.const 12))
      )
      i8x16.sub

      ;; store & jump to next 12 bytes
      local.set $x
      local.get $i
      local.get $x
      v128.store

      (local.set $i (i32.add (local.get $i) (i32.const 16)))
      (local.set $j (i32.add (local.get $j) (i32.const 12)))
      (i32.lt_u (local.get $j) (local.get $end))
      br_if 0
    )
  )
)
