package org.pulse.backend.controllers

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class HomeController {
    @RequestMapping(value = ["/", "/{x:[\\w\\-]+}", "/{x:^(?!api|authentication$).*$}/*/{y:[\\w\\-]+}"])
    fun index(): String {
        return "index.html"
    }
}