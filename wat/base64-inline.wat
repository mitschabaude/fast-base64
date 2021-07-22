(module
  (import "imports" "memory" (memory 0))

  (func $base642bytes (export "base642bytes") (param $n i32)
    (local $i i32)
    (local $j i32)
    (local $x i32)
    (local $tmp i32)
    (local $x1 i32)
    (local $x2 i32)
    (local $x3 i32)
    (local $x4 i32)

    (local.set $i (i32.const 0))
    (local.set $j (i32.const 0))

    (loop 
      local.get $i
      i32.load
      local.set $x

      ;; process first byte
      local.get $x
      i32.const 0x000000ff
      i32.and
      
      ;; inlined char2num
      local.tee $tmp
      i32.const 4
      i32.add
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 64))
        (i32.const 69)
      )
      i32.sub
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 96))
        (i32.const 6)
      )
      i32.sub
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 43))
        (i32.const 15)
      )
      i32.add
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 47))
        (i32.const 12)
      )
      i32.add
      ;; end inlined char2num

      i32.const 2 ;; << 2
      i32.shl

      ;; process second byte
      local.get $x
      i32.const 0x0000ff00
      i32.and
      i32.const 8 ;; >> 8
      i32.shr_u
      
      ;; inlined char2num
      local.tee $tmp
      i32.const 4
      i32.add
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 64))
        (i32.const 69)
      )
      i32.sub
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 96))
        (i32.const 6)
      )
      i32.sub
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 43))
        (i32.const 15)
      )
      i32.add
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 47))
        (i32.const 12)
      )
      i32.add
      ;; end inlined char2num
      
      local.tee $tmp
      i32.const 0x30
      i32.and
      i32.const 4 ;; << 8, >> 12
      i32.shr_u
      local.get $tmp
      i32.const 0x0f
      i32.and
      i32.const 12 ;; << 8, << 4
      i32.shl

      i32.or
      i32.or

      ;; process third byte
      local.get $x
      i32.const 0x00ff0000
      i32.and
      i32.const 16 ;; >> 16
      i32.shr_u
      
      ;; inlined char2num
      local.tee $tmp
      i32.const 4
      i32.add
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 64))
        (i32.const 69)
      )
      i32.sub
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 96))
        (i32.const 6)
      )
      i32.sub
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 43))
        (i32.const 15)
      )
      i32.add
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 47))
        (i32.const 12)
      )
      i32.add
      ;; end inlined char2num
      
      local.tee $tmp
      i32.const 0x3c
      i32.and
      i32.const 6 ;; << 16, >> 10
      i32.shl
      local.get $tmp
      i32.const 0x03
      i32.and
      i32.const 22 ;; << 16, << 6
      i32.shl

      i32.or
      i32.or

      ;; process fourth byte
      local.get $x
      i32.const 0xff000000
      i32.and
      i32.const 24 ;; >> 24
      i32.shr_u
      
      ;; inlined char2num
      local.tee $tmp
      i32.const 4
      i32.add
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 64))
        (i32.const 69)
      )
      i32.sub
      (i32.mul
        (i32.gt_u (local.get $tmp) (i32.const 96))
        (i32.const 6)
      )
      i32.sub
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 43))
        (i32.const 15)
      )
      i32.add
      (i32.mul
        (i32.eq (local.get $tmp) (i32.const 47))
        (i32.const 12)
      )
      i32.add
      ;; end inlined char2num
      
      i32.const 16 ;; << 24, >> 8
      i32.shl

      i32.or
      local.set $x

      local.get $j
      local.get $x
      i32.store

      (local.set $i (i32.add (local.get $i) (i32.const 4)))
      (local.set $j (i32.add (local.get $j) (i32.const 3)))
      (i32.lt_u (local.get $i) (local.get $n))
      br_if 0
    )
  )

  (func $num2char (param $x i32) (result i32)
    ;; x + 65 + (x > 25) * 6 - (x > 51) * 75 - (x === 62) * 15 - (x === 63) * 12
    local.get $x
    i32.const 65
    i32.add

    (i32.mul
      (i32.gt_u (local.get $x) (i32.const 25))
      (i32.const 6)
    )
    i32.add

    (i32.mul
      (i32.gt_u (local.get $x) (i32.const 51))
      (i32.const 75)
    )
    i32.sub

    (i32.mul
      (i32.eq (local.get $x) (i32.const 62))
      (i32.const 15)
    )
    i32.sub

    (i32.mul
      (i32.eq (local.get $x) (i32.const 63))
      (i32.const 12)
    )
    i32.sub
  )
)
