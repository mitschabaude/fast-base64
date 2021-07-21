  (module
  (import "imports" "log" (func $log (param i32)))
  (import "imports" "log" (func $log2 (param i32) (param i32)))
  (import "imports" "log" (func $log4
    (param i32) (param i32) (param i32) (param i32)
  ))
  (import "imports" "log" (func $log8
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
  ))
  (import "imports" "log" (func $log16
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
  ))

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
    i16x8.extract_lane_u 0
    local.get $x
    i16x8.extract_lane_u 1
    local.get $x
    i16x8.extract_lane_u 2
    local.get $x
    i16x8.extract_lane_u 3
    local.get $x
    i16x8.extract_lane_u 4
    local.get $x
    i16x8.extract_lane_u 5
    local.get $x
    i16x8.extract_lane_u 6
    local.get $x
    i16x8.extract_lane_u 7
    call $log8
  )
  (func $log32x4 (param $x v128)
    local.get $x
    i32x4.extract_lane 0
    local.get $x
    i32x4.extract_lane 1
    local.get $x
    i32x4.extract_lane 2
    local.get $x
    i32x4.extract_lane 3
    call $log4
  )
)