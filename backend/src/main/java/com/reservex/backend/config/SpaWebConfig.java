package com.reservex.backend.config;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves the built frontend out of src/main/resources/static/ (frontend/dist,
 * copied there at build time — see .gitignore) and falls back to index.html
 * for any path that isn't a real static file, so React Router's client-side
 * routes don't 404 on a hard refresh or a direct link.
 *
 * /api/** never reaches this: @RestController mappings are matched first by
 * Spring's handler-mapping order, so this resource handler only ever sees
 * what's left over. Harmless no-op in dev, where static/ is empty and the
 * app is served through the Vite dev server instead.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/static/")
        .resourceChain(true)
        .addResolver(new PathResourceResolver() {
          @Override
          protected Resource getResource(String resourcePath, Resource location) throws IOException {
            Resource requested = location.createRelative(resourcePath);
            if (requested.exists() && requested.isReadable()) {
              return requested;
            }
            return new ClassPathResource("/static/index.html");
          }
        });
  }
}
