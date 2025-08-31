<?php
/**
 * Plugin Name: Manşet Slider — iOS Clean (Segmented Pager)
 * Description: "manset" kategorisindeki görseller için slider. Koyu alt bar, numaralı segmentler; aktif segment cyan kutu + üstte üçgen. Hover’da geçiş, mobilde swipe.
 * Version: 2.3.0
 * Author: Atlas
 * License: GPL2+
 */

if (!defined('ABSPATH')) exit;

class Manset_Slider_Plugin {
    const SLUG = 'manset-slider';
    const VER  = '2.3.0';

    public function __construct() {
        add_shortcode('manset_slider', [$this, 'shortcode']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);
    }

    public function assets() {
        $css = plugin_dir_path(__FILE__) . 'assets/manset-slider.css';
        $js  = plugin_dir_path(__FILE__) . 'assets/manset-slider.js';
        $css_ver = file_exists($css) ? filemtime($css) : self::VER;
        $js_ver  = file_exists($js)  ? filemtime($js) : self::VER;

        wp_register_style(self::SLUG, plugins_url('assets/manset-slider.css', __FILE__), [], $css_ver);
        wp_register_script(self::SLUG, plugins_url('assets/manset-slider.js', __FILE__), [], $js_ver, true);
    }

    public function shortcode($atts = []) {
        $atts = shortcode_atts([
            'category'     => 'manset',
            'count'        => 15,
            'autoplay'     => 'true',
            'interval'     => 5000,
            'ratio'        => '16/9',
            'show_arrows'  => 'false',
            'image_size'   => 'full',
            'clickable'    => 'true'
        ], $atts, 'manset_slider');

        $cat_slug = sanitize_title($atts['category']);

        $q = new WP_Query([
            'post_type'           => 'post',
            'posts_per_page'      => intval($atts['count']),
            'post_status'         => 'publish',
            'ignore_sticky_posts' => true,
            'no_found_rows'       => true,
            'tax_query'           => [[
                'taxonomy' => 'category',
                'field'    => 'slug',
                'terms'    => $cat_slug,
            ]]
        ]);

        if (!$q->have_posts()) return '<div class="manset-slider__empty">Manşet bulunamadı.</div>';

        wp_enqueue_style(self::SLUG);
        wp_enqueue_script(self::SLUG);

        $uid = 'manset-' . wp_generate_uuid4();

        ob_start(); ?>
        <div class="manset-slider ios-clean" id="<?php echo esc_attr($uid); ?>"
             data-autoplay="<?php echo esc_attr($atts['autoplay']); ?>"
             data-interval="<?php echo esc_attr(intval($atts['interval'])); ?>"
             data-show-arrows="<?php echo esc_attr($atts['show_arrows']); ?>"
             data-clickable="<?php echo esc_attr($atts['clickable']); ?>"
             style="--ms-aspect: <?php echo esc_attr($atts['ratio']); ?>;">
            <div class="manset-slider__viewport">
                <div class="manset-slider__track">
                    <?php
                    $i=0;
                    while ($q->have_posts()): $q->the_post();
                        $img = get_the_post_thumbnail_url(get_the_ID(), $atts['image_size']);
                        if (!$img) continue;
                        $alt = esc_attr(get_the_title());
                        $href = get_permalink(); ?>
                        <div class="manset-slider__slide<?php echo $i===0?' is-active':''; ?>" data-index="<?php echo $i; ?>">
                            <?php if ($atts['clickable']==='true'): ?>
                                <a class="manset-slider__link" href="<?php echo esc_url($href); ?>" aria-label="<?php echo esc_attr(get_the_title()); ?>">
                                    <img src="<?php echo esc_url($img); ?>" alt="<?php echo $alt; ?>" loading="<?php echo $i>1?'lazy':'eager'; ?>">
                                </a>
                            <?php else: ?>
                                <img src="<?php echo esc_url($img); ?>" alt="<?php echo $alt; ?>" loading="<?php echo $i>1?'lazy':'eager'; ?>">
                            <?php endif; ?>
                        </div>
                    <?php $i++; endwhile; wp_reset_postdata(); ?>
                </div>

                <?php if ($atts['show_arrows']==='true'): ?>
                    <button class="manset-slider__arrow manset-slider__prev" aria-label="Önceki"><span>&lsaquo;</span></button>
                    <button class="manset-slider__arrow manset-slider__next" aria-label="Sonraki"><span>&rsaquo;</span></button>
                <?php endif; ?>
            </div>

            <div class="manset-slider__pager" role="tablist" aria-label="Manşet sayfaları">
                <?php for ($n=0; $n<$i; $n++): ?>
                    <button class="manset-slider__dot<?php echo $n===0?' is-active':''; ?>"
                            role="tab" aria-selected="<?php echo $n===0?'true':'false'; ?>"
                            data-index="<?php echo $n; ?>">
                        <span class="manset-slider__dot-num"><?php echo $n+1; ?></span>
                    </button>
                <?php endfor; ?>
            </div>
        </div>
        <script>window.__MansetSliderInit && window.__MansetSliderInit('<?php echo esc_js($uid); ?>');</script>
        <?php
        return ob_get_clean();
    }
}
new Manset_Slider_Plugin();