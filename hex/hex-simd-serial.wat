(module
  (import "imports" "memory" (memory 0))
  (import "imports" "log" (func $log (param i32)))
  (import "imports" "log" (func $log2 (param i32) (param i32)))
  (import "imports" "log" (func $log8
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
  ))
  (import "imports" "log" (func $log16
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
  ))

  (func $hex2bytes (export "hex2bytes")
    ;; for (let i = 0, j = 0; i < n; i += 2, j++) {
    ;;   M[j] = char2num(M[i]) * 16 + char2num(M[i+1])
    ;; }
    (param $n i32)
    (local $x v128)
    (local $i i32)
    (local $j i32)
    (local.set $i (i32.const 0))
    (local.set $j (i32.const 0))

    loop $for
      local.get $j

      (i32.add (local.get $i) (i32.const 1))
      local.get $i
      i32.const 48
      i8x16.splat
      v128.load8_lane 0
      v128.load8_lane 8
      call $char2num
      local.set $x

      local.get $x
      i16x8.extend_low_i8x16_u
      (v128.const i16x8 16 0 0 0 0 0 0 0)
      i16x8.mul

      local.get $x
      i16x8.extend_high_i8x16_u
      (v128.const i16x8 1 0 0 0 0 0 0 0)
      i16x8.mul

      i16x8.add
      local.tee $x

      i16x8.extract_lane_u 0
      i32.store8

      (local.set $i (i32.add (local.get $i) (i32.const 2)))
      (local.set $j (i32.add (local.get $j) (i32.const 1)))

      (i32.ne (local.get $i) (local.get $n))
      br_if $for
    end 
  )

  (func $char2num (param $x v128) (result v128)
    ;; return x - 48 - (x > 60)*39
    (i8x16.sub
      (i8x16.sub (local.get $x) (i8x16.splat (i32.const 48)))
      (v128.and
        (i8x16.gt_u (local.get $x) (i8x16.splat (i32.const 60)))
        (i8x16.splat (i32.const 39))
      )
    )
  )

  ;; (func $mul (param $x v128) (param $y v128) (result v128)
  ;;   (i8x16.mul (local.get $x) (local.get $y))
  ;; )

  (func $log8x16 (param $x v128)
    local.get $x
    i8x16.extract_lane_u 0
    local.get $x
    i8x16.extract_lane_u 1
    local.get $x
    i8x16.extract_lane_u 2
    local.get $x
    i8x16.extract_lane_u 3
    local.get $x
    i8x16.extract_lane_u 4
    local.get $x
    i8x16.extract_lane_u 5
    local.get $x
    i8x16.extract_lane_u 6
    local.get $x
    i8x16.extract_lane_u 7
    local.get $x
    i8x16.extract_lane_u 8
    local.get $x
    i8x16.extract_lane_u 9
    local.get $x
    i8x16.extract_lane_u 10
    local.get $x
    i8x16.extract_lane_u 11
    local.get $x
    i8x16.extract_lane_u 12
    local.get $x
    i8x16.extract_lane_u 13
    local.get $x
    i8x16.extract_lane_u 14
    local.get $x
    i8x16.extract_lane_u 15
    call $log16
  )

  (func $log16x8 (param $x v128)
    local.get $x
    i8x16.extract_lane_u 0
    local.get $x
    i8x16.extract_lane_u 1
    local.get $x
    i8x16.extract_lane_u 2
    local.get $x
    i8x16.extract_lane_u 3
    local.get $x
    i8x16.extract_lane_u 4
    local.get $x
    i8x16.extract_lane_u 5
    local.get $x
    i8x16.extract_lane_u 6
    local.get $x
    i8x16.extract_lane_u 7
    call $log8
  )
)
