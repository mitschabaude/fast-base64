(module
  (import "imports" "memory" (memory 0))
  ;; (import "imports" "log" (func $log (param i32)))

  (func $base642bytes (export "base642bytes") (param $n i32)
    (local $i i32)
    (local $j i32)
    (local $x v128)
    (local $x1 i32)
    (local $x2 i32)
    (local $x3 i32)
    (local $x4 i32)

    (local.set $i (i32.const 0))
    (local.set $j (i32.const 0))

    (loop 
      local.get $i
      v128.load
      call $char2num
      local.set $x

      local.get $j

      local.get $x
      i8x16.extract_lane_u 0
      (i32.const 18)
      i32.shl
      local.tee $x1

      local.get $x
      i8x16.extract_lane_u 1
      (i32.const 12)
      i32.shl
      local.tee $x2

      i32.add
      (i32.const 16)
      i32.shr_u

      i32.store8
      (local.set $j (i32.add (local.get $j) (i32.const 1)))

      local.get $j
      local.get $x2

      local.get $x
      i8x16.extract_lane_u 2
      (i32.const 6)
      i32.shl
      local.tee $x3

      i32.add
      (i32.const 8)
      i32.shr_u
      (i32.const 255)
      i32.and

      i32.store8
      (local.set $j (i32.add (local.get $j) (i32.const 1)))
      
      local.get $j
      local.get $x3
      
      local.get $x
      i8x16.extract_lane_u 3
      local.tee $x4

      i32.add
      (i32.const 255)
      i32.and

      i32.store8

      (local.set $i (i32.add (local.get $i) (i32.const 4)))
      (local.set $j (i32.add (local.get $j) (i32.const 1)))
      (i32.lt_u (local.get $i) (local.get $n))
      br_if 0
    )
  )

  (func $char2num (param $x v128) (result v128)
    ;; return (
    ;;   x +
    ;;   (x > 47) * 4 -
    ;;   (x > 64) * 69 -
    ;;   (x > 96) * 6 +
    ;;   (x == 43) * 19 +
    ;;   (x == 47) * 16
    ;; );
    local.get $x
    (v128.and
      (i8x16.gt_u (local.get $x) (i8x16.splat (i32.const 47)))
      (i8x16.splat (i32.const 4))
    )
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
      (i8x16.splat (i32.const 19))
    )
    i8x16.add

    (v128.and
      (i8x16.eq (local.get $x) (i8x16.splat (i32.const 47)))
      (i8x16.splat (i32.const 16))
    )
    i8x16.add
  )
)
