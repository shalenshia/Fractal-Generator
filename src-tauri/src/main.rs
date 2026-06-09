use tauri::command;

#[command]
fn generate_mandelbrot(
    width: usize,
    height: usize,
    max_iter: u32,
    x_min: f64,
    x_max: f64,
    y_min: f64,
    y_max: f64,
) -> Vec<u8> {

    let mut data = vec![0u8; width * height];

    for y in 0..height {
        for x in 0..width {

            let cx = x_min + (x as f64 / width as f64) * (x_max - x_min);
            let cy = y_min + (y as f64 / height as f64) * (y_max - y_min);

            let mut zx = 0.0;
            let mut zy = 0.0;

            let mut iter = 0;

            while zx*zx + zy*zy < 4.0 && iter < max_iter {

                let temp = zx*zx - zy*zy + cx;

                zy = 2.0*zx*zy + cy;
                zx = temp;

                iter += 1;
            }

            data[y * width + x] =
                ((iter as f64 / max_iter as f64) * 255.0) as u8;
        }
    }

    data
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(
            tauri::generate_handler![generate_mandelbrot]
        )
        .run(tauri::generate_context!())
        .expect("error");
}

fn main() {
    run();
}